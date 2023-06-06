import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BaseTreeRepository } from './basetree.repostory';
import {
  EntityNotFoundError,
  In,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { PaginateOptions, PaginateReturn, QueryHook, ServiceListQueryOption } from '../types';
import { isArray, isFunction, isNil } from 'lodash';
import { BaseRepository } from './base.repository';
import { TreeChildrenResolve } from '../constants';
import { SelectTrashMode } from '@/modules/core/constants';
import { manualPaginate, paginate } from '../helpers';

@Injectable()
export abstract class BaseService<
  E extends ObjectLiteral,
  R extends BaseRepository<E> | BaseTreeRepository<E>,
  P extends ServiceListQueryOption<E> = ServiceListQueryOption<E>,
> {
  protected repository: R;

  /**
   * 是否开启软删除功能
   */
  protected enableTrash = false;

  constructor(protected repository2: R) {
    this.repository = repository2;
    if (
      !(
        this.repository instanceof BaseRepository ||
        this.repository instanceof BaseTreeRepository
      )
    ) {
      throw new Error(
        'Repository must instance of BaseRepository or BaseTreeRepository in DataService!',
      );
    }
  }

  /**
     * 获取数据列表
     * @param params 查询参数
     * @param callback 回调查询
     */
  async list(options?: P, callback?: QueryHook<E>): Promise<E[]> {
    const { trashed: isTrashed = false } = options ?? {};
    const trashed = isTrashed || SelectTrashMode.NONE;
    if (this.repository instanceof BaseTreeRepository) {
        const withTrashed =
            this.enableTrash &&
            (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY);
        const onlyTrashed = this.enableTrash && trashed === SelectTrashMode.ONLY;
        const tree = await this.repository.findTrees({
            ...options,
            withTrashed,
            onlyTrashed,
        });
        return this.repository.toFlatTrees(tree);
    }
    const qb = await this.buildListQB(this.repository.buildBaseQB(), options, callback);
    return qb.getMany();
}

/**
 * 获取分页数据
 * @param options 分页选项
 * @param callback 回调查询
 */
async paginate(
    options?: PaginateOptions & P,
    callback?: QueryHook<E>,
): Promise<PaginateReturn<E>> {
    const queryOptions = (options ?? {}) as P;
    if (this.repository instanceof BaseTreeRepository) {
        const data = await this.list(queryOptions, callback);
        return manualPaginate(options, data) as PaginateReturn<E>;
    }
    const qb = await this.buildListQB(this.repository.buildBaseQB(), queryOptions, callback);
    return paginate(qb, options);
}

  /**
   * 查询单篇文章
   * @param id
   * @param callback 添加额外的查询
   */
  async detail(id: string, callback?: QueryHook<E>) {
    let qb = this.repository.buildBaseQB();
    qb.where(`${this.repository.qbName}.id = :id`, { id });
    qb = !isNil(callback) && isFunction(callback) ? await callback(qb) : qb;
    const item = await qb.getOne();
    if (!item)
      throw new NotFoundException(
        `The  ${this.repository.qbName} ${id} not exists!`,
      );
    return item;
  }
 /**
     * 创建数据,如果子类没有实现则抛出404
     * @param data 请求数据
     * @param others 其它参数
     */
    create(data: any, ...others: any[]): Promise<E> {
        throw new ForbiddenException(`Can not to create ${this.repository.qbName}!`);
    }

    /**
     * 更新数据,如果子类没有实现则抛出404
     * @param data 请求数据
     * @param others 其它参数
     */
    update(data: any, ...others: any[]): Promise<E> {
        throw new ForbiddenException(`Can not to update ${this.repository.qbName}!`);
    }

  /**
   * 删除文章
   * @param ids
   */
  async deleteBatch(ids: string[], trash?: boolean) {
    let items: E[] = [];
    if (this.repository instanceof BaseRepository) {
      const items = await this.repository.find({
        where: { id: In(ids) as any },
        withDeleted: this.enableTrash ? true : undefined,
      });
      this.repository.remove(items);
      return items;
    } else {
      items = await this.repository.find({
        where: { id: In(ids) as any },
        withDeleted: this.enableTrash ? true : undefined,
        relations: ['parent', 'children'],
      });
      if (this.repository.childrenResolve === TreeChildrenResolve.UP) {
        for (const item of items) {
          if (isNil(item.children) || item.children.length <= 0) continue;
          const nchildren = [...item.children].map((c) => {
            c.parent = item.parent;
            return item;
          });
          await this.repository.save(nchildren);
        }
      }
    }
    if (this.enableTrash && trash) {
      const directs = items.filter((item) => !isNil(item.deletedAt));
      const softs = items.filter((item) => isNil(item.deletedAt));
      return [
        ...(await this.repository.remove(directs)),
        ...(await this.repository.softRemove(softs)),
      ];
    }
    return this.repository.remove(items);
  }

  /**
   * 批量恢复回收站中的数据
   * @param data 需要恢复的id列表
   */
  async restore(ids: string[]) {
    if (!this.enableTrash) {
      throw new ForbiddenException(
        `Can not to retore ${this.repository.qbName},because trash not enabled!`,
      );
    }
    const items = await this.repository.find({
      where: { id: In(ids) as any },
      withDeleted: true,
    });
    const trasheds = items.filter((item) => !isNil(item));
    if (trasheds.length < 0) return [];
    await this.repository.restore(trasheds.map((item) => item.id));
    const qb = await this.buildListQB(
      this.repository.buildBaseQB(),
      undefined,
      async (builder) => builder.andWhereInIds(trasheds),
    );
    return qb.getMany();
  }

  /**
   * 获取查询数据列表的 QueryBuilder
   * @param qb querybuilder实例
   * @param options 查询选项
   * @param callback 查询回调
   */
  protected async buildListQB(
    qb: SelectQueryBuilder<E>,
    options?: P,
    callback?: QueryHook<E>,
  ) {
    const { trashed } = options ?? {};
    const queryName = this.repository.qbName;
    // 是否查询回收站
    if (
      this.enableTrash &&
      (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY)
    ) {
      qb.withDeleted();
      if (trashed === SelectTrashMode.ONLY) {
        qb.where(`${queryName}.deletedAt is not null`);
      }
    }
    if (callback) return callback(qb);
    return qb;
  }

  /**
   * 获取查询单个项目的QueryBuilder
   * @param id 查询数据的ID
   * @param qb querybuilder实例
   * @param callback 查询回调
   */
  protected async buildItemQB(
    id: string,
    qb: SelectQueryBuilder<E>,
    callback?: QueryHook<E>,
  ) {
    qb.where(`${this.repository.qbName}.id = :id`, { id });
    if (callback) return callback(qb);
    return qb;
  }
}

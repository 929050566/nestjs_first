import { CategoryRepository } from './../repository/category.repository';
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PostRepository } from "../repository/post.repository";
import { PostEntity } from "../entities/post.entity";
import { isArray, isFunction, isNil, omit } from "lodash";
import { EntityNotFoundError, In, IsNull, Not, SelectQueryBuilder } from "typeorm";
import { PostOrderType } from "../constants";
import { PaginateOptions, QueryHook, } from "@/modules/database/types";
import { SelectTrashMode } from "@/modules/core/constants";
import { SearchService } from "./search.service";
import { SearchType } from "../types/types";
import { QueryPostDto, UpdatePostDto } from "../dtos/post.dto";
import { classToPlain, plainToInstance } from "class-transformer";
import { CategoryService } from './category.service';
import { manualPaginate, paginate } from '@/modules/database/helpers';
import { BaseService } from '@/modules/database/base/base.service';

// 文章查询接口
type FindParams = {
    [key in keyof Omit<QueryPostDto, 'limit' | 'page'>]: QueryPostDto[key];
};

// src/modules/content/services/post.service.ts
@Injectable()
export class PostService extends BaseService<PostEntity, PostRepository, FindParams> {
    protected enableTrash = true;

    constructor(protected repository: PostRepository,
        protected categoryRepository: CategoryRepository,
        protected categoryService: CategoryService,
        protected searchService?: SearchService,
        protected search_type: SearchType = 'against',
    ) {
        super(repository);
    }

    /**
        * 获取分页数据
        * @param options 分页选项
        * @param callback 添加额外的查询
        */
    async paginate(options: QueryPostDto, callback?: QueryHook<PostEntity>) {
        if (
            !isNil(this.searchService) &&
            !isNil(options.search) &&
            this.search_type === 'elastic'
        ) {
            const { search: text, page, limit } = options;
            const results = await this.searchService.search(text);
            const ids = results.map((result) => result.id);
            const posts =
                ids.length <= 0 ? [] : await this.repository.find({ where: { id: In(ids) } });
            return manualPaginate({ page, limit }, posts);
        }
        const qb = await this.buildListQB(this.repository.buildBaseQB(), options, callback);
        return paginate(qb, options);
    }

    /**
     * 查询单篇文章
     * @param id
     * @param callback 添加额外的查询
     */
    async detail(id: string, callback?: QueryHook<PostEntity>) {
        let qb = this.repository.buildBaseQB();
        qb.where(`post.id = :id`, { id });
        qb = !isNil(callback) && isFunction(callback) ? await callback(qb) : qb;
        const item = await qb.getOne();
        if (!item) throw new EntityNotFoundError(PostEntity, `The post ${id} not exists!`);
        return item;
    }

    /**
     * 创建文章
     * @param data
     */
    async create(data: Record<string, any>) {
        if (!isNil(this.searchService)) {
            try {
                const dataPlain = plainToInstance(PostEntity, data)
                console.log(dataPlain)
                await this.searchService.create(dataPlain);
            } catch (err) {
                throw new InternalServerErrorException(err);
            }
        }
        const createPostDto = {
            ...data,
            // 文章所属分类
            categories: isArray(data.categories)
                ? await this.categoryRepository.findBy({
                    id: In(data.categories),
                })
                : [],
        };
        const item = await this.repository.save(createPostDto);
        return this.detail(item.id);
    }

    /**
     * 更新文章
     * @param data
     */
    async update(data: UpdatePostDto) {
        const post = await this.detail(data.id);
        if (isArray(data.categories)) {
            // 更新文章所属分类
            await this.repository
                .createQueryBuilder('post')
                .relation(PostEntity, 'categories')
                .of(post)
                .addAndRemove(data.categories, post.categories ?? []);
        }
        await this.repository.update(data.id, omit(data, ['id', "categories"]));
        return this.detail(data.id);
    }

    /**
     * 删除文章
     * @param id
     */
    async delete(id: string) {
        const item = await this.repository.findOneByOrFail({ id });
        return this.repository.remove(item);
    }

    async deleteTrash(ids: string[], trash?: boolean) {
        const items = await this.repository.find({
            where: { id: In(ids) } as any,
            withDeleted: true,
        });
        if (trash) {
            // 对已软删除的数据再次删除时直接通过remove方法从数据库中清除
            const directs = items.filter((item) => !isNil(item.deleteAt));
            const softs = items.filter((item) => isNil(item.deleteAt));
            return [
                ...(await this.repository.remove(directs)),
                ...(await this.repository.softRemove(softs)),
            ];
        }
        return this.repository.remove(items);
    }

    /**
   * 删除文章
   * @param id
   */
    async deleteBatch(ids: string[]) {
        const items = await this.repository.find({ where: { id: In(ids) } });
        return this.repository.remove(items);
    }

    /**
    * 恢复文章
    * @param ids
    */
    async restore(ids: string[]) {
        const items = await this.repository.find({
            where: { id: In(ids) } as any,
            withDeleted: true,
        });
        // 过滤掉不在回收站中的数据
        const trasheds = items.filter((item) => !isNil(item)).map((item) => item.id);
        if (trasheds.length < 0) return [];
        await this.repository.restore(trasheds);
        const qb = await this.buildListQuery(this.repository.buildBaseQB(), {}, async (qbuilder) =>
            qbuilder.andWhereInIds(trasheds),
        );
        return qb.getMany();
    }

    /**
     * 构建文章列表查询器
     * @param qb 初始查询构造器
     * @param options 排查分页选项后的查询选项
     * @param callback 添加额外的查询
     */
    protected async buildListQuery(
        qb: SelectQueryBuilder<PostEntity>,
        options: Record<string, any>,
        callback?: QueryHook<PostEntity>,
    ) {
        const { category, orderBy, isPublished, trashed = SelectTrashMode.NONE } = options;
        let newQb = qb;
        // 是否查询回收站
        if (trashed === SelectTrashMode.ALL || trashed === SelectTrashMode.ONLY) {
            qb.withDeleted();
            if (trashed === SelectTrashMode.ONLY) qb.where(`post.deletedAt is not null`);
        }
        if (typeof isPublished === 'boolean') {
            newQb = isPublished
                ? newQb.where({
                    publishedAt: Not(IsNull()),
                })
                : newQb.where({
                    publishedAt: IsNull(),
                });
        }
        const search = options.search
        if (!isNil(search)) {
            if (this.search_type === 'like') {
                qb.andWhere('title LIKE :search', { search: `%${search}%` })
                    .orWhere('body LIKE :search', { search: `%${search}%` })
                    .orWhere('summary LIKE :search', { search: `%${search}%` })
                    .orWhere('post.categories LIKE :search', {
                        search: `%${search}%`,
                    });
            } else {
                qb.andWhere('MATCH(title) AGAINST (:search IN BOOLEAN MODE)', {
                    search: `${search}*`,
                })
                    .orWhere('MATCH(body) AGAINST (:search IN BOOLEAN MODE)', {
                        search: `${search}*`,
                    })
                    .orWhere('MATCH(summary) AGAINST (:search IN BOOLEAN MODE)', {
                        search: `${search}*`,
                    })
                    .orWhere('MATCH(categories.name) AGAINST (:search IN BOOLEAN MODE)', {
                        search: `${search}*`,
                    });
            }
        }
        newQb = this.queryOrderBy(newQb, orderBy);
        if (callback) return callback(newQb);
        return newQb;
    }

    /**
     *  对文章进行排序的Query构建
     * @param qb
     * @param orderBy 排序方式
     */
    protected queryOrderBy(qb: SelectQueryBuilder<PostEntity>, orderBy?: PostOrderType) {
        switch (orderBy) {
            case PostOrderType.CREATED:
                return qb.orderBy('post.createdAt', 'DESC');
            case PostOrderType.UPDATED:
                return qb.orderBy('post.updatedAt', 'DESC');
            case PostOrderType.PUBLISHED:
                return qb.orderBy('post.publishedAt', 'DESC');
            case PostOrderType.CUSTOM:
                return qb.orderBy('customOrder', 'DESC');
            default:
                return qb
                    .orderBy('post.createdAt', 'DESC')
                    .addOrderBy('post.updatedAt', 'DESC')
                    .addOrderBy('post.publishedAt', 'DESC')
                    .addOrderBy('commentCount', 'DESC');
        }
    }

    /**
 * 查询出分类及其后代分类下的所有文章的Query构建
 * @param id
 * @param qb
 */
    protected async queryByCategory(id: string, qb: SelectQueryBuilder<PostEntity>) {
        const root = await this.categoryService.detail(id);
        const tree = await this.categoryRepository.findDescendantsTree(root);
        const flatDes = await this.categoryRepository.toFlatTrees(tree.children);
        const ids = [tree.id, ...flatDes.map((item) => item.id)];
        return qb.where('categories.id IN (:...ids)', {
            ids,
        });
    }
}




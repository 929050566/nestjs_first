import { CustomRepository } from '@/modules/database/decorators/repository.decorator';
import {
  FindOptionsUtils,
  FindTreeOptions,
  ObjectLiteral,
  Repository,
  SelectQueryBuilder,
  TreeRepository,
} from 'typeorm';
import { isNil, pick, unset } from 'lodash';
import { getOrderByQuery } from '../helpers';
import { OrderQueryType } from '../types';

// src/modules/content/repositories/category.repository.ts
export abstract class BaseRepository<
  T extends ObjectLiteral,
> extends Repository<T> {
  /**
   * 模型对应的查询名称
   */
  protected abstract _queryName: string;

  /**
   * 排序
   */
  protected abstract orderBy?:
    | string
    | { name: string; order: `${WorkerType}` };

  /**
   * 返回查询器名称
   */
  get qbName() {
    return this._queryName;
  }

  /**
   * 构建基础查询器
   */
  buildBaseQB() {
    return this.createQueryBuilder(this.qbName);
  }

  /**
   * 生成排序的QueryBuilder
   * @param qb
   * @param orderBy
   */
  addOrderByQuery(qb: SelectQueryBuilder<T>, orderBy?: OrderQueryType) {
    const orderByQuery = orderBy ?? this.orderBy;
    return !isNil(orderByQuery)
      ? getOrderByQuery(qb, this.qbName, orderBy)
      : qb;
  }


}

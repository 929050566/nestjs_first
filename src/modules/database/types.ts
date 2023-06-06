// // src/modules/database/types.ts

import { IPaginationMeta, IPaginationOptions } from 'nestjs-typeorm-paginate';
import { FindTreeOptions, ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { OrderType } from './constants';
import { SelectTrashMode } from '../core/constants';

/**
 * 分页验证DTO接口
 */
export interface IPaginateDto<C extends IPaginationMeta = IPaginationMeta>
  extends Omit<IPaginationOptions<C>, 'page' | 'limit'> {
  page: number;
  limit: number;
}

/**
 * 为queryBuilder添加查询的回调函数接口
 */
export type QueryHook<Entity> = (
  qb: SelectQueryBuilder<Entity>,
) => Promise<SelectQueryBuilder<Entity>>;

/**
 * 分页原数据
 */
export interface PaginateMeta {
  /**
   * 当前页项目数量
   */
  itemCount: number;
  /**
   * 项目总数量
   */
  totalItems?: number;
  /**
   * 每页显示数量
   */
  perPage: number;
  /**
   * 总页数
   */
  totalPages?: number;
  /**
   * 当前页数
   */
  currentPage: number;
}
/**
 * 分页选项
 */
export interface PaginateOptions {
  /**
   * 当前页数
   */
  page: number;
  /**
   * 每页显示数量
   */
  limit: number;
}

/**
 * 分页返回数据
 */
export interface PaginateReturn<E extends ObjectLiteral> {
  meta: PaginateMeta;
  items: E[];
}

/**
 * 排序类型,{字段名称: 排序方法}
 * 如果多个值则传入数组即可
 * 排序方法不设置,默认DESC
 */
export type OrderQueryType =
  | string
  | { name: string; order: `${OrderType}` }
  | Array<{ name: string; order: `${OrderType}` } | string>;

// src/modules/database/types.ts
/**
 * 数据列表查询类型
 */
export interface QueryParams<E extends ObjectLiteral> {
  addQuery?: QueryHook<E>;
  orderBy?: OrderQueryType;
  withTrashed?: boolean;
  onlyTrashed?: boolean;
}

// src/modules/database/types.ts
/**
 * 服务类数据列表查询类型
 */
export type ServiceListQueryOption<E extends ObjectLiteral> =
  | ServiceListQueryOptionWithTrashed<E>
  | ServiceListQueryOptionNotWithTrashed<E>;

/**
 * 带有软删除的服务类数据列表查询类型
 */
type ServiceListQueryOptionWithTrashed<E extends ObjectLiteral> = Omit<
  FindTreeOptions & QueryParams<E>,
  'withTrashed'
> & {
  trashed?: `${SelectTrashMode}`;
} & Record<string, any>;

/**
 * 不带软删除的服务类数据列表查询类型
 */
type ServiceListQueryOptionNotWithTrashed<E extends ObjectLiteral> = Omit<
  ServiceListQueryOptionWithTrashed<E>,
  'trashed'
>;

// src/modules/database/types.ts
/**
 * 软删除选项
 */
export interface TrashedOptions {
  trashed?: SelectTrashMode;
}

import { CustomRepository } from '@/modules/database/decorators/repository.decorator';
import { CategoryEntity } from '../entities/category.entiry';
import { FindOptionsUtils, FindTreeOptions, TreeRepository } from 'typeorm';
import { pick, unset } from 'lodash';
import { BaseTreeRepository } from '@/modules/database/base/basetree.repostory';
import { TreeChildrenResolve } from '@/modules/database/constants';

// src/modules/content/repositories/category.repository.ts
@CustomRepository(CategoryEntity)
export class CategoryRepository extends BaseTreeRepository<CategoryEntity> {
  protected _qbName = 'category';
  protected orderBy = 'createdAt';
  protected _childrenResolve = TreeChildrenResolve.UP;
}

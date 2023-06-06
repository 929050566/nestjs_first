import { Column, Entity, ManyToMany, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from "typeorm";
import { PostEntity } from "./post.entity";
import { Exclude, Expose, Type } from "class-transformer";
import { MyBaseEntity } from "@/modules/database/base/base.entity";

// src/modules/content/entities/category.entity.ts
@Exclude()
@Tree('materialized-path')
@Entity('content_categories')
export class CategoryEntity extends MyBaseEntity {
 
    @Expose()
    @Column({ comment: '分类名称' })
    name: string;

    @Expose({ groups: ['category-tree', 'category-list', 'category-detail'] })
    @Column({ comment: '分类排序', default: 0 })
    customOrder: number;

    @Expose({ groups: ['category-list'] })
    depth = 0;

    @Expose({ groups: ['category-detail', 'category-list'] })
    @Type(() => CategoryEntity)
    @TreeParent({ onDelete: 'NO ACTION' })
    parent: CategoryEntity | null;

    @Expose({ groups: ['category-tree'] })
    @Type(() => CategoryEntity)
    @TreeChildren({ cascade: true })
    children: CategoryEntity[];

    @ManyToMany((type) => PostEntity, (post) => post.categories)
    posts: PostEntity[];
}
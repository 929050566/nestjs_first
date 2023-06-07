import { AfterLoad, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PostBodyType } from "../constants";
import { Exclude, Expose, Type } from "class-transformer";
import { CategoryEntity } from "./category.entiry";
import { CommentEntity } from "./comment.entity";
import { MyBaseEntity } from "@/modules/database/base/base.entity";

// src/modules/content/entities/post.entity.ts
@Exclude()
@Entity('content_posts')
export class PostEntity extends MyBaseEntity {

    @Expose()
    @Column({ comment: '文章标题' })
    @Index({ fulltext: true })
    title!: string;

    @Expose({ groups: ['post-detail'] })
    @Column({ comment: '文章内容', type: 'longtext' })
    @Index({ fulltext: true })
    body!: string;

    @Expose()
    @Column({ comment: '文章描述', nullable: true })
    summary?: string;

    @Expose()
    @Column({ comment: '关键字', type: 'simple-array', nullable: true })
    keywords?: string[];
    @Expose()
    @Column({
        comment: '文章类型',
        type: 'enum',
        enum: PostBodyType,
        default: PostBodyType.MD,
    })
    type!: PostBodyType;
    @Expose()
    @Column({
        comment: '发布时间',
        type: 'varchar',
        nullable: true,
    })
    publishedAt?: Date | null;
    @Expose()
    @Column({ comment: '文章排序', default: 0 })
    customOrder!: number;

    @Expose()
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt!: Date;
    @Expose()
    @UpdateDateColumn({
        comment: '更新时间',
    })
    updatedAt!: Date;

    // ...
    @Expose()
    @Type(() => Date)
    @DeleteDateColumn({
        comment: '删除时间',
    })
    deleteAt!: Date;

    @Expose()
    @Type(() => CategoryEntity)
    @ManyToMany(() => CategoryEntity, (category) => category.posts, {
        // 在新增文章时,如果所属分类不存在则直接创建
        cascade: true,
    })
    @JoinTable()
    categories: CategoryEntity[];

    @OneToMany((type) => CommentEntity, (comment) => comment.post, {
        cascade: true,
    })
    comments!: CommentEntity[];

    @Expose()
    commentCount!: number;

    @AfterLoad()
    generateCount(): void {
        if (this.body) {
            console.log("测试")
        }
    }

}
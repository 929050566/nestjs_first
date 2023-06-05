import { Exclude, Expose, Type } from "class-transformer";
import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent } from "typeorm";
import { PostEntity } from "./post.entity";

// src/modules/content/entities/comment.entity.ts
@Exclude()
@Tree('materialized-path')
@Entity('content_comments')
export class CommentEntity extends BaseEntity {

    @Expose()
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Expose()
    @Column({ comment: '评论内容', type: 'longtext' })
    body!: string;

    @Expose()
    @Column({ comment: '关联文章'})
    postId!: string;

    @Expose()
    @Column({ comment: '路径'})
    mpath?: string;

    @Expose()
    @CreateDateColumn({
        comment: '创建时间',
    })
    createdAt!: Date;

    @Expose()
    @ManyToOne((type) => PostEntity, (post) => post.comments, {
        // 文章不能为空
        nullable: false,
        // 跟随父表删除与更新
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    post!: PostEntity;

    @TreeParent({ onDelete: 'CASCADE' })
    parent!: CommentEntity | null;

    @Expose({ groups: ['category-tree'] })
    @Type(() => CommentEntity)
    @TreeChildren({ cascade: true })
    children!: CommentEntity[];
    
    @Expose({ groups: ['category-list'] })
    depth = 0;

}

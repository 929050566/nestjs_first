import { FindOptionsUtils, FindTreeOptions, SelectQueryBuilder, TreeRepository, TreeRepositoryUtils } from "typeorm";
import { CommentEntity } from "../entities/comment.entity";
import { CustomRepository } from "@/modules/database/decorators/repository.decorator";
import { isNil, pick, unset } from "lodash";
import { BaseTreeRepository } from "@/modules/database/base/basetree.repostory";
import { QueryParams } from "@/modules/database/types";

// src/modules/content/repositories/comment.repository.ts
type FindCommentTreeOptions = FindTreeOptions & {
    addQuery?: (query: SelectQueryBuilder<CommentEntity>) => SelectQueryBuilder<CommentEntity>;
};

@CustomRepository(CommentEntity)
export class CommentRepository extends BaseTreeRepository<CommentEntity> {
    /**
     * 构建基础查询器
     */
    buildBaseQB(qb: SelectQueryBuilder<CommentEntity>): SelectQueryBuilder<CommentEntity> {
        return super.buildBaseQB(qb)
            .leftJoinAndSelect(`${this.qbName}.post`, 'post')
            .orderBy(`${this.qbName}.createdAt`, 'DESC');
    }

    async findTrees(
        options: FindTreeOptions & QueryParams<CommentEntity> & { post?: string } = {},
    ): Promise<CommentEntity[]> {
        return super.findTrees({
            ...options,
            addQuery: async (qb) => {
                return isNil(options.post) ? qb : qb.where('post.id = :id', { id: options.post });
            },
        });
    }

}
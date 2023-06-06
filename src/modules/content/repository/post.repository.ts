import { CustomRepository } from '@/modules/database/decorators/repository.decorator';
import { PostEntity } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';
import { BaseRepository } from '@/modules/database/base/base.repository';

// src/modules/content/repositories/post.repository.ts
@CustomRepository(PostEntity)
export class PostRepository extends BaseRepository<PostEntity> {
  protected _queryName: "post";
  protected orderBy?: string | { name: string; order: WorkerType; };
  buildBaseQB() {
    // 在查询之前先查询出评论数量在添加到commentCount字段上
    return this.createQueryBuilder()
      .leftJoinAndSelect('post.categories', 'categories')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(c.id)', 'count')
          .from(CommentEntity, 'c')
          .where('c.post.id = post.id');
      }, 'commentCount')
      .loadRelationCountAndMap('post.commentCount', 'post.comments');
    }
}

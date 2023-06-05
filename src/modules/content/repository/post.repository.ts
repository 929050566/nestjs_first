import { CustomRepository } from '@/modules/database/decorators/repository.decorator';
import { PostEntity } from '../entities/post.entity';
import { Repository } from 'typeorm';
import { CommentEntity } from '../entities/comment.entity';

// src/modules/content/repositories/post.repository.ts
@CustomRepository(PostEntity)
export class PostRepository extends Repository<PostEntity> {
  buildBaseQB() {
    // 在查询之前先查询出评论数量在添加到commentCount字段上
    return this.createQueryBuilder('post')
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

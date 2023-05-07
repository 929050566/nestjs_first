import { CustomRepository } from "@/modules/database/decorators/repository.decorator";
import { PostEntity } from "../entities/post.entity";
import { Repository } from "typeorm";

// src/modules/content/repositories/post.repository.ts
@CustomRepository(PostEntity)
export class PostRepository extends Repository<PostEntity> {
    buildBaseQB() {
        return this.createQueryBuilder('post');
    }
}
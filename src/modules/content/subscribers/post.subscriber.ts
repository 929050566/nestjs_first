import { DataSource, EventSubscriber, ObjectType } from "typeorm";
import { SanitizeService } from "../services/sanitize.service";
import { PostRepository } from "../repository/post.repository";
import { PostEntity } from "../entities/post.entity";
import { PostBodyType } from "../constants";
import { BaseSubscriber } from "@/modules/database/base/base.subscriber";

// src/modules/content/subscribers/post.subscriber.ts
@EventSubscriber()
export class PostSubscriber extends BaseSubscriber<PostEntity>{

    protected entity: ObjectType<PostEntity> = PostEntity;

    constructor(
        protected dataSource: DataSource,
        protected sanitizeService: SanitizeService,
        protected postRepository: PostRepository,
    ) {
        super(dataSource)
    }

    listenTo() {
        return PostEntity;
    }

    /**
     * 加载文章数据的处理
     * @param entity
     */
    async afterLoad(entity: PostEntity) {
        if (entity.type === PostBodyType.HTML) {
            entity.body = this.sanitizeService.sanitize(entity.body);
        }
    }
}
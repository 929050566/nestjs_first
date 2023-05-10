import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseModule } from "../database/database.modules";
import { PostEntity } from "./entities/post.entity";
import { PostRepository } from "./repository/post.repository";
import { Module } from "@nestjs/common";
import { PostController } from "./controllers/post.controller";
import { PostService } from "./services/post.service";
import { PostSubscriber } from "./subscribers/post.subscriber";
import { SanitizeService } from "./services/sanitize.service";

// src/modules/content/content.module.ts
@Module({
    imports: [
        TypeOrmModule.forFeature([PostEntity]),
        DatabaseModule.forRepository([PostRepository])
    ],
    controllers: [PostController],
    providers: [PostService, PostSubscriber, SanitizeService],
    exports: [PostService, DatabaseModule.forRepository([PostRepository])],
})
export class ContentModule {}
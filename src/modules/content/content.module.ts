import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseModule } from "../database/database.modules";
import { PostEntity } from "./entities/post.entity";
import { PostRepository } from "./repository/post.repository";
import { Module } from "@nestjs/common";

// src/modules/content/content.module.ts
@Module({
    imports: [
        TypeOrmModule.forFeature([PostEntity]),
        DatabaseModule.forRepository([PostRepository]),
    ],
    controllers: [],
    providers: [],
    exports: [DatabaseModule.forRepository([PostRepository])],
})
export class ContentModule {}
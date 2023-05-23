import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseModule } from "../database/database.modules";
import { PostEntity } from "./entities/post.entity";
import { PostRepository } from "./repository/post.repository";
import { Module, ValidationPipe } from "@nestjs/common";
import { PostController } from "./controllers/post.controller";
import { PostService } from "./services/post.service";
import { PostSubscriber } from "./subscribers/post.subscriber";
import { SanitizeService } from "./services/sanitize.service";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { AppIntercepter } from "../core/prividers/app.interceptor";
import { AppFilter } from "../core/prividers/app.filter";
import { AppPipe } from "../core/prividers/app.pipe";

// src/modules/content/content.module.ts
@Module({
    imports: [
        TypeOrmModule.forFeature([PostEntity]),
        DatabaseModule.forRepository([PostRepository])
    ],
    controllers: [PostController],
    providers: [PostService, PostSubscriber, SanitizeService,
        {
            provide: APP_PIPE,
            useValue: new AppPipe({
              transform: true,
              forbidUnknownValues: true,
              validationError: { target: false },
            })
          },
          {
            provide: APP_INTERCEPTOR,
            useClass: AppIntercepter,
          },
          {
            provide: APP_FILTER,
            useClass: AppFilter
          }],
    exports: [PostService, DatabaseModule.forRepository([PostRepository])],
})
export class ContentModule {}
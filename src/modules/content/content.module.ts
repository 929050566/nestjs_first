import { TypeOrmModule } from "@nestjs/typeorm";
import { DatabaseModule } from "../database/database.modules";
import { PostEntity } from "./entities/post.entity";
import { PostRepository } from "./repository/post.repository";
import { DynamicModule, Module, ModuleMetadata, ValidationPipe } from "@nestjs/common";
import { PostController } from "./controllers/post.controller";
import { PostService } from "./services/post.service";
import { PostSubscriber } from "./subscribers/post.subscriber";
import { SanitizeService } from "./services/sanitize.service";
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from "@nestjs/core";
import { AppIntercepter } from "../core/prividers/app.interceptor";
import { AppFilter } from "../core/prividers/app.filter";
import { AppPipe } from "../core/prividers/app.pipe";
import { SearchService } from "./services/search.service";
import { ContentConfig } from "./types/types";
import { ElasticModule } from "../elastic/elastic.module";
import { elastic } from "@/config/elastic.config";
import { CategoryService } from "./services/category.service";
import { CategoryRepository } from "./repository/category.repository";
import { CategoryEntity } from "./entities/category.entiry";
import { CommentEntity } from "./entities/comment.entity";
import { CommentRepository } from "./repository/comment.repository";
import { CommentService } from "./services/comment.service";
import { CategoryController } from "./controllers/category.controller";
import { CommentController } from "./controllers/comment.controller";

// src/modules/content/content.module.ts
// @Module({
//     imports: [
//         TypeOrmModule.forFeature([PostEntity]),
//         DatabaseModule.forRepository([PostRepository])
//     ],
//     controllers: [PostController],
//     providers: [PostService, PostSubscriber, SanitizeService, SearchService,
//         {
//             provide: APP_PIPE,
//             useValue: new AppPipe({
//               transform: true,
//               forbidUnknownValues: true,
//               validationError: { target: false },
//             })
//           },
//           {
//             provide: APP_INTERCEPTOR,
//             useClass: AppIntercepter,
//           },
//           {
//             provide: APP_FILTER,
//             useClass: AppFilter
//           }],
//     exports: [PostService, DatabaseModule.forRepository([PostRepository])],
// })
export class ContentModule {
  static forRoot(configRegister?: () => ContentConfig): DynamicModule {
    const config: Required<ContentConfig> = {
      searchType: 'against',
      ...(configRegister ? configRegister() : {}),
    };
    const providers: ModuleMetadata['providers'] = [
      SanitizeService,
      PostSubscriber,
      CategoryService,
      CommentService,
      {
        provide: PostService,
        inject: [
          PostRepository,
          { token: SearchService, optional: true },
          CategoryService,
          CategoryRepository,
        ],
        useFactory(
          postRepository: PostRepository,
          searchService?: SearchService,
          categoryService?: CategoryService,
          categoryRepository?: CategoryRepository,
        ) {
          return new PostService(
            postRepository,
            categoryRepository,
            categoryService,
            searchService,
            config.searchType,
          );
        },
      },
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
      }
    ];
    if (config.searchType === 'elastic') providers.push(SearchService);
    return {
      module: ContentModule,
      imports: [
        TypeOrmModule.forFeature([PostEntity, CategoryEntity, CommentEntity]),
        DatabaseModule.forRepository([PostRepository, CategoryRepository, CommentRepository]),
        ElasticModule.forRoot(elastic)
      ],
      controllers: [PostController, CategoryController, CommentController],
      providers,
      exports: [
        PostService, DatabaseModule.forRepository([PostRepository])
      ],
    };
  }
}
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
        searchType: 'elastic',
        ...(configRegister ? configRegister() : {}),
    };
    const providers: ModuleMetadata['providers'] = [
        SanitizeService,
        PostSubscriber,
        {
            provide: PostService,
            inject: [
                PostRepository,
                { token: SearchService, optional: true },
            ],
            useFactory(
                postRepository: PostRepository,
                searchService?: SearchService,
            ) {
                return new PostService(
                    postRepository,
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
            TypeOrmModule.forFeature([PostEntity]),
            DatabaseModule.forRepository([PostRepository]),
            ElasticModule.forRoot(elastic)
        ],
        controllers: [PostController],
        providers,
        exports: [
          PostService, DatabaseModule.forRepository([PostRepository])
        ],
    };
}
}
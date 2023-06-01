import { DynamicModule, Module } from "@nestjs/common";
import { ElasticsearchModule, ElasticsearchModuleOptions } from "@nestjs/elasticsearch";

// src/modules/elastic/elastic.module.ts
@Module({})
export class ElasticModule {
    static forRoot(configRegister: () => ElasticsearchModuleOptions): DynamicModule {
        return {
            global: true,
            module: ElasticModule,
            imports: [ElasticsearchModule.register(configRegister())],
            exports: [ElasticsearchModule],
        };
    }
}
// src/config/elastic.config.ts
import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';

export const elastic = (): ElasticsearchModuleOptions => ({
    node: 'http://localhost:9200',
    maxRetries: 10,
    requestTimeout: 3000,
    pingTimeout: 3000,
    sniffOnStart: true,
});
// src/config/database.config.ts
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * 数据库配置
 */
export const database = (): TypeOrmModuleOptions => ({
    charset: 'utf8mb4',
    logging: ['error'],
    type: 'mysql',
    host: '127.0.0.1',
    port: 3306,
    username: 'root',
    password: '123123',
    database: 'master1',
    synchronize: true,
    autoLoadEntities: true,
    // entities: []
});

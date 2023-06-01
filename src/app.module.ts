import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.modules';
import { database } from './config/database.config';
import { ContentModule } from './modules/content/content.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppIntercepter } from './modules/core/prividers/app.interceptor';
import { AppFilter } from './modules/core/prividers/app.filter';
import { ElasticModule } from './modules/elastic/elastic.module';
import { elastic } from './config/elastic.config';

@Module({
  imports: [DatabaseModule.forRoot(database), ElasticModule.forRoot(elastic), ContentModule.forRoot()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
 
import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './modules/database/database.modules';
import { database } from './config/database.config';
import { ContentModule } from './modules/content/content.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppIntercepter } from './modules/core/prividers/app.interceptor';
import { AppFilter } from './modules/core/prividers/app.filter';

@Module({
  imports: [DatabaseModule.forRoot(database), ContentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
 
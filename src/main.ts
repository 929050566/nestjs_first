import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {NestFastifyApplication, FastifyAdapter} from '@nestjs/platform-fastify'
import { useContainer } from 'class-validator';
import { get } from 'http';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors();
  useContainer(app.select(AppModule), {
    fallbackOnErrors: true
  })
  await app.listen(3000);
}
bootstrap();

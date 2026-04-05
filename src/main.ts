import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use('/webhook', express.raw({ type: 'application/json' }));

  app.setGlobalPrefix('v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // enables class-transformer
      whitelist: true, // strips unknown fields
      forbidNonWhitelisted: true, // throws error for extra fields
    }),
  );

  const logger = app.get(Logger);

  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API documentation for my NestJS project')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  logger.log('Swagger documentation initialized at http://localhost:5353/api');
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

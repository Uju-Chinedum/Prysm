import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './components/app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  app.use(cookieParser());

  const config = new DocumentBuilder()
    .setTitle('Prysm API')
    .setDescription('API documentation for Prysm')
    .setVersion('1.0')
    .addTag('Prysm')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1', app, document);

  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);
  console.log(`Server is listening on port ${port}`);
}

bootstrap();

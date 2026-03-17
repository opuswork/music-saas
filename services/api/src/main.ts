import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Music SaaS API')
    .setDescription('Interactive Music Education Platform API')
    .setVersion('1.0')
    .addBearerAuth() // JWT 대비
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  await app.listen(3001);
}
bootstrap();
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

// 🌟 [추가] 프론트엔드에서 백엔드 API에 접근할 수 있도록 허용합니다.
app.enableCors();

// 1. 모든 API 주소 앞에 /api를 붙입니다.
  app.setGlobalPrefix('api');

  // 🔹 Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Music SaaS API')
    .setDescription('Interactive Music Education Platform API')
    .setVersion('1.0')
    .addBearerAuth() // JWT 대비
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 2. Swagger 문서는 /docs에서 확인하도록 변경 (api와 충돌 방지)
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap();
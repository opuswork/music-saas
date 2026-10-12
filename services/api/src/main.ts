import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

/** Comma-separated list of browser origins allowed to call the API. */
const DEFAULT_CORS_ORIGINS = 'http://localhost:3000,http://127.0.0.1:3000';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 보안 헤더 (CSP는 JSON API에 불필요하고 Swagger UI와 충돌하므로 끔)
  app.use(helmet({ contentSecurityPolicy: false }));

  // 프론트엔드 출처만 API에 접근하도록 허용합니다. (CORS_ORIGINS 환경변수로 변경)
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? DEFAULT_CORS_ORIGINS)
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
  });

  // 1. 모든 API 주소 앞에 /api를 붙입니다.
  app.setGlobalPrefix('api');

  // 🔹 Swagger 설정 — 운영(production)에서는 API 문서를 공개하지 않습니다.
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Music SaaS API')
      .setDescription('Interactive Music Education Platform API')
      .setVersion('1.0')
      .addBearerAuth() // JWT 대비
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // 2. Swagger 문서는 /docs에서 확인하도록 변경 (api와 충돌 방지)
    SwaggerModule.setup('docs', app, document);
  }

  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 4000, '0.0.0.0');
}
bootstrap();

import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from '@/common/filters/global-exception.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { AppLogger } from '@/logger/app-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  const config = app.get('ConfigService' as any);
  const port = config.get<number>('app.port') ?? 3001;
  const apiPrefix = config.get<string>('app.apiPrefix') ?? 'api/v1';
  const corsOrigin = config.get<string>('app.corsOrigin') ?? 'http://localhost:3000';
  const isProd = config.get<string>('app.nodeEnv') === 'production';

  // ── Security headers ─────────────────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: isProd,
      crossOriginEmbedderPolicy: false,
    }),
  );

  // ── CORS ─────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Global prefix ─────────────────────────────────────────────────────────
  app.setGlobalPrefix(apiPrefix);

  // ── Validation pipe (class-validator for NestJS DTOs) ────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Global filter & interceptor ───────────────────────────────────────────
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  // ── Swagger (disabled in production) ─────────────────────────────────────
  if (!isProd) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DUA Streamliner API')
      .setDescription('Backend REST API for automated DUA document generation')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('health')
      .addTag('sessions')
      .addTag('dua')
      .addTag('users')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
    logger.log(`Swagger docs available at /${apiPrefix}/docs`, 'Bootstrap');
  }

  // ── Body size limits ──────────────────────────────────────────────────────
  // File upload endpoints override this via multer; global limit = 10 MB
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.use(require('express').json({ limit: '10mb' }));
  expressApp.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

  await app.listen(port);
  logger.log(`API server running on port ${port}`, 'Bootstrap');
}

bootstrap();

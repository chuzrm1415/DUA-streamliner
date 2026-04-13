import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import {
  appConfig,
  databaseConfig,
  redisConfig,
  azureStorageConfig,
  openAiConfig,
  queueConfig,
} from '@/config/app.config';
import { LoggerModule } from '@/logger/logger.module';
import { DatabaseModule } from '@/database/database.module';
import { StorageModule } from '@/storage/storage.module';
import { AiModule } from '@/ai/ai.module';
import { DocumentProcessingWorkerModule } from '@/workers/document-processing/document-processing-worker.module';
import { AppLogger } from '@/logger/app-logger.service';

/**
 * Minimal NestJS module for the standalone worker process.
 * Contains only what the worker needs — no HTTP server, no API routes.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig, azureStorageConfig, openAiConfig, queueConfig],
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password') || undefined,
        },
      }),
    }),
    LoggerModule,
    DatabaseModule,
    StorageModule,
    AiModule,
    DocumentProcessingWorkerModule,
  ],
})
class WorkerAppModule {}

async function bootstrapWorker() {
  const app = await NestFactory.createApplicationContext(WorkerAppModule, {
    bufferLogs: true,
  });

  const logger = app.get(AppLogger);
  app.useLogger(logger);

  logger.log('Document processing worker started', 'WorkerBootstrap');

  // Keep the process alive
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received — shutting down worker gracefully', 'WorkerBootstrap');
    await app.close();
    process.exit(0);
  });
}

bootstrapWorker();

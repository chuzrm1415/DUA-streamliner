import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule } from '@nestjs/throttler';

// Config
import {
  appConfig,
  databaseConfig,
  redisConfig,
  azureAdConfig,
  azureStorageConfig,
  openAiConfig,
  uploadConfig,
  queueConfig,
} from '@/config/app.config';

// Infrastructure
import { DatabaseModule } from '@/database/database.module';
import { LoggerModule } from '@/logger/logger.module';
import { StorageModule } from '@/storage/storage.module';
import { AiModule } from '@/ai/ai.module';

// Feature modules
import { AuthModule } from '@/modules/auth/auth.module';
import { UsersModule } from '@/modules/users/users.module';
import { SessionsModule } from '@/modules/sessions/sessions.module';
import { DuaModule } from '@/modules/dua/dua.module';
import { HealthModule } from '@/modules/health/health.module';

// Worker
import { DocumentProcessingWorkerModule } from '@/workers/document-processing/document-processing-worker.module';

@Module({
  imports: [
    // ── Config ─────────────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfig,
        databaseConfig,
        redisConfig,
        azureAdConfig,
        azureStorageConfig,
        openAiConfig,
        uploadConfig,
        queueConfig,
      ],
    }),

    // ── Rate limiting ───────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        throttlers: [
          { name: 'global', ttl: 60_000, limit: 100 },
        ],
      }),
    }),

    // ── BullMQ (Redis connection shared across modules) ─────────────────
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

    // ── Infrastructure ──────────────────────────────────────────────────
    LoggerModule,
    DatabaseModule,
    StorageModule,
    AiModule,

    // ── Features ────────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    SessionsModule,
    DuaModule,
    HealthModule,

    // ── Worker (runs inside API process in development) ─────────────────
    DocumentProcessingWorkerModule,
  ],
})
export class AppModule {}

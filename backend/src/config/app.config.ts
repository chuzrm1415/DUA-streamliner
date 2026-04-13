import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
}));

export const databaseConfig = registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  password: process.env.REDIS_PASSWORD,
}));

export const azureAdConfig = registerAs('azureAd', () => ({
  tenantId: process.env.AZURE_AD_TENANT_ID,
  clientId: process.env.AZURE_AD_CLIENT_ID,
  audience: process.env.AZURE_AD_AUDIENCE,
}));

export const azureStorageConfig = registerAs('azureStorage', () => ({
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
  containerUploads: process.env.AZURE_STORAGE_CONTAINER_UPLOADS ?? 'uploads',
  containerGenerated: process.env.AZURE_STORAGE_CONTAINER_GENERATED ?? 'generated-dua',
}));

export const openAiConfig = registerAs('openAi', () => ({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL ?? 'gpt-4o',
  maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS ?? '4096', 10),
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE ?? '0.1'),
}));

export const uploadConfig = registerAs('upload', () => ({
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '50', 10),
  maxRequestSizeMb: parseInt(process.env.MAX_REQUEST_SIZE_MB ?? '100', 10),
  allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES ?? '').split(','),
}));

export const queueConfig = registerAs('queue', () => ({
  concurrency: parseInt(process.env.QUEUE_CONCURRENCY ?? '5', 10),
  maxRetries: parseInt(process.env.QUEUE_MAX_RETRIES ?? '3', 10),
  backoffDelayMs: parseInt(process.env.QUEUE_BACKOFF_DELAY_MS ?? '5000', 10),
  maxConcurrentJobsPerUser: parseInt(process.env.MAX_CONCURRENT_JOBS_PER_USER ?? '3', 10),
}));

import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HealthController } from './health.controller';
import { DOCUMENT_PROCESSING_QUEUE } from '@/workers/document-processing/queue.constants';

@Module({
  imports: [BullModule.registerQueue({ name: DOCUMENT_PROCESSING_QUEUE })],
  controllers: [HealthController],
})
export class HealthModule {}

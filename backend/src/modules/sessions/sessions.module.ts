import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { DOCUMENT_PROCESSING_QUEUE } from '@/workers/document-processing/queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: DOCUMENT_PROCESSING_QUEUE }),
  ],
  providers: [SessionsService],
  controllers: [SessionsController],
  exports: [SessionsService],
})
export class SessionsModule {}

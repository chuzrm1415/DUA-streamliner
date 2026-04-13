import { Module } from '@nestjs/common';
import { DuaService } from './dua.service';
import { DuaController } from './dua.controller';
import { DocumentProcessingWorkerModule } from '@/workers/document-processing/document-processing-worker.module';

@Module({
  imports: [DocumentProcessingWorkerModule],
  providers: [DuaService],
  controllers: [DuaController],
})
export class DuaModule {}

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '@/database/prisma.service';
import { StorageService } from '@/storage/storage.service';
import { AiService } from '@/ai/ai.service';
import { AppLogger } from '@/logger/app-logger.service';
import { DocumentParserContext } from './document-parser.strategies';
import { DuaDocumentGenerator } from './dua-document.generator';
import { DOCUMENT_PROCESSING_QUEUE, PROCESS_DOCUMENTS_JOB } from './queue.constants';
import type { DocumentProcessingJobPayload } from '@/common/types';
import { ConfigService } from '@nestjs/config';

@Processor(DOCUMENT_PROCESSING_QUEUE, {
  concurrency: 5,
})
export class DocumentProcessingWorker extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly ai: AiService,
    private readonly parser: DocumentParserContext,
    private readonly generator: DuaDocumentGenerator,
    private readonly logger: AppLogger,
    private readonly config: ConfigService,
  ) {
    super();
  }

  async process(job: Job<DocumentProcessingJobPayload>): Promise<void> {
    const { sessionId, userId, documentIds } = job.data;

    this.logger.logEvent({
      type: 'JOB_STARTED',
      sessionId,
      userId,
      jobId: job.id?.toString(),
      status: 'success',
    });

    try {
      // ── Step 1: Mark job as processing ─────────────────────────────────
      await this.updateJobStatus(sessionId, 'PROCESSING');
      await this.updateProgress(sessionId, 10);

      // ── Step 2: Parse documents ────────────────────────────────────────
      const extractedTexts: string[] = [];

      for (let i = 0; i < documentIds.length; i++) {
        const document = await this.prisma.document.findUnique({
          where: { id: documentIds[i] },
        });
        if (!document) continue;

        await this.prisma.document.update({
          where: { id: document.id },
          data: { status: 'PROCESSING' },
        });

        const buffer = await this.storage.downloadFile(document.blobPath);
        const text = await this.parser.parse(document.format, buffer, document.id);

        await this.prisma.document.update({
          where: { id: document.id },
          data: { extractedText: text, status: 'DONE' },
        });

        extractedTexts.push(text);

        const progress = 10 + Math.floor(((i + 1) / documentIds.length) * 40);
        await this.updateProgress(sessionId, progress);
      }

      // ── Step 3: AI semantic extraction ────────────────────────────────
      await this.updateProgress(sessionId, 55);
      await this.updateSessionStatus(sessionId, 'GENERATING');

      const combinedText = extractedTexts.join('\n\n---\n\n');
      const extractedData = await this.ai.extractDuaFields(combinedText, sessionId);
      const duaFields = this.ai.mapToDuaFields(extractedData);

      // ── Step 4: Store preliminary DUA data ────────────────────────────
      await this.updateProgress(sessionId, 75);

      await this.prisma.duaData.upsert({
        where: { sessionId },
        update: { fields: duaFields as any, status: 'PRELIMINARY' },
        create: { sessionId, fields: duaFields as any, status: 'PRELIMINARY' },
      });

      // ── Step 5: Generate preliminary .docx ────────────────────────────
      await this.updateProgress(sessionId, 85);

      const docBuffer = await this.generator.generate(duaFields, sessionId);
      const blobName = this.storage.generateDuaBlobName(sessionId);
      const blobPath = await this.storage.uploadFile(
        docBuffer,
        blobName,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        this.config.get('azureStorage.containerGenerated'),
      );

      await this.prisma.duaData.update({
        where: { sessionId },
        data: { blobPath },
      });

      // ── Step 6: Mark complete ──────────────────────────────────────────
      await this.updateProgress(sessionId, 100);
      await this.updateSessionStatus(sessionId, 'REVIEW');
      await this.updateJobStatus(sessionId, 'COMPLETED');

      this.logger.logEvent({
        type: 'JOB_COMPLETED',
        sessionId,
        userId,
        jobId: job.id?.toString(),
        status: 'success',
      });
    } catch (err: any) {
      this.logger.logEvent({
        type: 'JOB_FAILED',
        sessionId,
        userId,
        jobId: job.id?.toString(),
        status: 'failure',
        error: err.message,
      });

      await this.updateSessionStatus(sessionId, 'FAILED', err.message);
      await this.updateJobStatus(sessionId, 'FAILED', err.message);

      // Mark all pending documents as errored
      await this.prisma.document.updateMany({
        where: { sessionId, status: 'PROCESSING' },
        data: { status: 'ERROR' },
      });

      throw err; // Re-throw so BullMQ can retry
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private async updateProgress(sessionId: string, progress: number) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { progress },
    });
  }

  private async updateSessionStatus(
    sessionId: string,
    status: any,
    error?: string,
  ) {
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status, ...(error && { error }) },
    });
  }

  private async updateJobStatus(
    sessionId: string,
    status: any,
    error?: string,
  ) {
    await this.prisma.processingJob.update({
      where: { sessionId },
      data: {
        status,
        ...(error && { error }),
        ...(status === 'PROCESSING' && { startedAt: new Date() }),
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
    });
  }
}

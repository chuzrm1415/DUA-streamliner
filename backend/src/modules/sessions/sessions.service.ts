import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { StorageService } from '@/storage/storage.service';
import { AppLogger } from '@/logger/app-logger.service';
import { Session, SessionStatus, DocumentFormat } from '@prisma/client';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { DOCUMENT_PROCESSING_QUEUE } from '@/workers/document-processing/queue.constants';
import type { DocumentProcessingJobPayload } from '@/common/types';

const MIME_TO_FORMAT: Record<string, DocumentFormat> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'image/png': 'IMAGE',
  'image/jpeg': 'IMAGE',
  'image/tiff': 'IMAGE',
};

@Injectable()
export class SessionsService {
  private readonly maxConcurrentJobsPerUser: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
    @InjectQueue(DOCUMENT_PROCESSING_QUEUE) private readonly queue: Queue,
  ) {
    this.maxConcurrentJobsPerUser = this.config.get<number>('queue.maxConcurrentJobsPerUser') ?? 3;
  }

  /**
   * Upload files, store in blob, create Session + Documents, enqueue job.
   */
  async createSession(
    userId: string,
    files: Express.Multer.File[],
  ): Promise<Session & { documents: any[] }> {
    // Enforce concurrent job limit
    const activeCount = await this.prisma.session.count({
      where: {
        userId,
        status: { in: ['PROCESSING', 'UPLOADING', 'GENERATING'] },
      },
    });
    if (activeCount >= this.maxConcurrentJobsPerUser) {
      throw new ForbiddenException(
        `Maximum of ${this.maxConcurrentJobsPerUser} concurrent sessions allowed`,
      );
    }

    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }

    // Create session record
    const session = await this.prisma.session.create({
      data: { userId, status: 'UPLOADING' },
    });

    // Upload each file to blob and create Document records
    const documents = await Promise.all(
      files.map(async (file) => {
        const blobName = this.storage.generateBlobName(session.id, file.originalname);
        const blobPath = await this.storage.uploadFile(
          file.buffer,
          blobName,
          file.mimetype,
          this.config.get('azureStorage.containerUploads'),
        );

        const format: DocumentFormat = MIME_TO_FORMAT[file.mimetype] ?? 'PDF';

        return this.prisma.document.create({
          data: {
            sessionId: session.id,
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeBytes: file.size,
            blobPath,
            format,
          },
        });
      }),
    );

    // Create job record and enqueue
    const job = await this.prisma.processingJob.create({
      data: { sessionId: session.id },
    });

    const bullJob = await this.queue.add(
      'process-documents',
      {
        sessionId: session.id,
        userId,
        documentIds: documents.map((d) => d.id),
      } satisfies DocumentProcessingJobPayload,
      {
        attempts: this.config.get<number>('queue.maxRetries'),
        backoff: {
          type: 'exponential',
          delay: this.config.get<number>('queue.backoffDelayMs'),
        },
        removeOnComplete: false,
        removeOnFail: false,
      },
    );

    // Store BullMQ job id
    await this.prisma.processingJob.update({
      where: { id: job.id },
      data: { bullJobId: bullJob.id?.toString() },
    });

    await this.prisma.session.update({
      where: { id: session.id },
      data: { status: 'PROCESSING' },
    });

    this.logger.logEvent({
      type: 'SESSION_CREATED',
      userId,
      sessionId: session.id,
      status: 'success',
      metadata: { fileCount: files.length },
    });

    return { ...session, status: 'PROCESSING', documents };
  }

  /**
   * Get session with documents and DUA data — validates ownership.
   */
  async getSession(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: { documents: true, duaData: true },
    });

    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Access denied');

    return session;
  }

  /**
   * List sessions for a user.
   */
  async listSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      include: { documents: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  /**
   * Update session status and progress — called by the worker.
   */
  async updateStatus(
    sessionId: string,
    status: SessionStatus,
    progress?: number,
    error?: string,
  ) {
    return this.prisma.session.update({
      where: { id: sessionId },
      data: {
        status,
        ...(progress !== undefined && { progress }),
        ...(error && { error }),
        ...(status === 'FINALIZED' && { completedAt: new Date() }),
      },
    });
  }
}

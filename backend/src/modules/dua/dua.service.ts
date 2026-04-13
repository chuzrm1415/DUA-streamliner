import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { StorageService } from '@/storage/storage.service';
import { AppLogger } from '@/logger/app-logger.service';
import { DuaDocumentGenerator } from '@/workers/document-processing/dua-document.generator';
import type { DuaField } from '@/common/types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DuaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly generator: DuaDocumentGenerator,
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Retrieve preliminary DUA data for review.
   */
  async getPreliminaryDua(sessionId: string, userId: string) {
    await this.assertOwnership(sessionId, userId);

    const duaData = await this.prisma.duaData.findUnique({ where: { sessionId } });
    if (!duaData) throw new NotFoundException('DUA data not found for this session');

    return {
      id: duaData.id,
      sessionId: duaData.sessionId,
      status: duaData.status,
      fields: duaData.fields as DuaField[],
    };
  }

  /**
   * Update fields after user review.
   * Marks edited fields as user-validated (high confidence).
   */
  async updateFields(
    sessionId: string,
    userId: string,
    updates: Record<string, string>,
  ) {
    await this.assertOwnership(sessionId, userId);

    const duaData = await this.prisma.duaData.findUnique({ where: { sessionId } });
    if (!duaData) throw new NotFoundException('DUA data not found');
    if (duaData.status === 'FINAL') {
      throw new BadRequestException('Cannot edit a finalized DUA');
    }

    const fields = (duaData.fields as DuaField[]).map((field) => {
      if (updates[field.key] !== undefined) {
        return {
          ...field,
          value: updates[field.key],
          confidence: 'high' as const,
          userValidated: true,
        };
      }
      return field;
    });

    await this.prisma.duaData.update({
      where: { sessionId },
      data: { fields: fields as any },
    });

    this.logger.logEvent({
      type: 'DUA_FIELDS_UPDATED',
      sessionId,
      userId,
      status: 'success',
      metadata: { updatedKeys: Object.keys(updates) },
    });

    return { sessionId, fields };
  }

  /**
   * Validate and generate the final DUA document.
   */
  async generateFinal(
    sessionId: string,
    userId: string,
    fieldOverrides: Record<string, string>,
  ) {
    await this.assertOwnership(sessionId, userId);

    const duaData = await this.prisma.duaData.findUnique({ where: { sessionId } });
    if (!duaData) throw new NotFoundException('DUA data not found');

    // Apply overrides
    let fields = (duaData.fields as DuaField[]).map((f) =>
      fieldOverrides[f.key] !== undefined
        ? { ...f, value: fieldOverrides[f.key], confidence: 'high' as const, userValidated: true }
        : f,
    );

    // Validate required fields
    const missingRequired = fields.filter((f) => f.required && !f.value);
    if (missingRequired.length > 0) {
      throw new BadRequestException(
        `Missing required fields: ${missingRequired.map((f) => f.label).join(', ')}`,
      );
    }

    // Generate final .docx
    const docBuffer = await this.generator.generate(fields, sessionId);
    const blobName = this.storage.generateDuaBlobName(sessionId);
    const blobPath = await this.storage.uploadFile(
      docBuffer,
      blobName,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      this.config.get('azureStorage.containerGenerated'),
    );

    // Persist final state
    await this.prisma.duaData.update({
      where: { sessionId },
      data: { fields: fields as any, status: 'FINAL', blobPath },
    });

    await this.prisma.session.update({
      where: { id: sessionId },
      data: { status: 'FINALIZED', completedAt: new Date() },
    });

    await this.prisma.processingJob.update({
      where: { sessionId },
      data: { status: 'FINALIZED', completedAt: new Date() },
    });

    this.logger.logEvent({
      type: 'DUA_FINALIZED',
      sessionId,
      userId,
      status: 'success',
    });

    return { sessionId, status: 'FINAL', downloadReady: true };
  }

  /**
   * Stream the final DUA .docx file back to the client.
   */
  async downloadDua(sessionId: string, userId: string): Promise<{ buffer: Buffer; filename: string }> {
    await this.assertOwnership(sessionId, userId);

    const duaData = await this.prisma.duaData.findUnique({ where: { sessionId } });
    if (!duaData?.blobPath) throw new NotFoundException('Generated document not found');

    const buffer = await this.storage.downloadFile(duaData.blobPath);

    this.logger.logEvent({
      type: 'DUA_DOWNLOADED',
      sessionId,
      userId,
      status: 'success',
    });

    return { buffer, filename: `DUA_${sessionId}.docx` };
  }

  private async assertOwnership(sessionId: string, userId: string) {
    const session = await this.prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new NotFoundException('Session not found');
    if (session.userId !== userId) throw new ForbiddenException('Access denied');
    return session;
  }
}

import { Injectable } from '@nestjs/common';
import { AppLogger } from '@/logger/app-logger.service';
import { DocumentFormat } from '@prisma/client';

// ─────────────────────────────────────────────
// Strategy interface
// ─────────────────────────────────────────────
export interface DocumentParsingStrategy {
  canHandle(format: DocumentFormat): boolean;
  parse(buffer: Buffer): Promise<string>;
}

// ─────────────────────────────────────────────
// PDF Strategy
// ─────────────────────────────────────────────
@Injectable()
export class PdfParsingStrategy implements DocumentParsingStrategy {
  canHandle(format: DocumentFormat) { return format === 'PDF'; }

  async parse(buffer: Buffer): Promise<string> {
    // Dynamic import avoids issues at module load time
    const pdfParse = (await import('pdf-parse')).default;
    const result = await pdfParse(buffer);
    return result.text;
  }
}

// ─────────────────────────────────────────────
// DOCX Strategy
// ─────────────────────────────────────────────
@Injectable()
export class DocxParsingStrategy implements DocumentParsingStrategy {
  canHandle(format: DocumentFormat) { return format === 'DOCX'; }

  async parse(buffer: Buffer): Promise<string> {
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}

// ─────────────────────────────────────────────
// XLSX Strategy
// ─────────────────────────────────────────────
@Injectable()
export class XlsxParsingStrategy implements DocumentParsingStrategy {
  canHandle(format: DocumentFormat) { return format === 'XLSX'; }

  async parse(buffer: Buffer): Promise<string> {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const lines: string[] = [];
    workbook.SheetNames.forEach((name) => {
      const sheet = workbook.Sheets[name];
      const csv = XLSX.utils.sheet_to_csv(sheet);
      lines.push(`=== Sheet: ${name} ===\n${csv}`);
    });
    return lines.join('\n\n');
  }
}

// ─────────────────────────────────────────────
// OCR Strategy (Tesseract.js for images)
// ─────────────────────────────────────────────
@Injectable()
export class OcrParsingStrategy implements DocumentParsingStrategy {
  canHandle(format: DocumentFormat) { return format === 'IMAGE'; }

  async parse(buffer: Buffer): Promise<string> {
    const Tesseract = await import('tesseract.js');
    const result = await Tesseract.recognize(buffer, 'spa+eng', {
      // Suppress console output from Tesseract
      logger: () => {},
    });
    return result.data.text;
  }
}

// ─────────────────────────────────────────────
// Context — selects strategy at runtime
// ─────────────────────────────────────────────
@Injectable()
export class DocumentParserContext {
  private readonly strategies: DocumentParsingStrategy[];

  constructor(
    private readonly logger: AppLogger,
    private readonly pdf: PdfParsingStrategy,
    private readonly docx: DocxParsingStrategy,
    private readonly xlsx: XlsxParsingStrategy,
    private readonly ocr: OcrParsingStrategy,
  ) {
    this.strategies = [pdf, docx, xlsx, ocr];
  }

  async parse(format: DocumentFormat, buffer: Buffer, documentId: string): Promise<string> {
    const strategy = this.strategies.find((s) => s.canHandle(format));
    if (!strategy) {
      throw new Error(`No parsing strategy for format: ${format}`);
    }

    this.logger.logEvent({
      type: 'DOCUMENT_PARSING_STARTED',
      status: 'success',
      metadata: { format, documentId },
    });

    const text = await strategy.parse(buffer);

    this.logger.logEvent({
      type: 'DOCUMENT_PARSING_COMPLETED',
      status: 'success',
      metadata: { format, documentId, charCount: text.length },
    });

    return text;
  }
}

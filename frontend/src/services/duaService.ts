import type { DocumentFormat, UploadedDocument } from "@/types";

// ─────────────────────────────────────────────
// Strategy Pattern — Document Processing
// ─────────────────────────────────────────────

/**
 * Interface that all document processing strategies must implement.
 */
export interface DocumentProcessingStrategy {
  canHandle(format: DocumentFormat): boolean;
  process(file: File): Promise<string>; // returns extracted text
}

/**
 * Strategy for structured Excel files.
 */
export class ExcelProcessingStrategy implements DocumentProcessingStrategy {
  canHandle(format: DocumentFormat) {
    return format === "xlsx";
  }
  async process(file: File): Promise<string> {
    // TODO: call backend /extract/xlsx endpoint
    throw new Error(`ExcelProcessingStrategy.process not yet implemented for ${file.name}`);
  }
}

/**
 * Strategy for Word documents.
 */
export class WordProcessingStrategy implements DocumentProcessingStrategy {
  canHandle(format: DocumentFormat) {
    return format === "docx";
  }
  async process(file: File): Promise<string> {
    // TODO: call backend /extract/docx endpoint
    throw new Error(`WordProcessingStrategy.process not yet implemented for ${file.name}`);
  }
}

/**
 * Strategy for PDF text extraction.
 */
export class PDFProcessingStrategy implements DocumentProcessingStrategy {
  canHandle(format: DocumentFormat) {
    return format === "pdf";
  }
  async process(file: File): Promise<string> {
    // TODO: call backend /extract/pdf endpoint
    throw new Error(`PDFProcessingStrategy.process not yet implemented for ${file.name}`);
  }
}

/**
 * Strategy for OCR on scanned images.
 */
export class ImageOCRStrategy implements DocumentProcessingStrategy {
  canHandle(format: DocumentFormat) {
    return format === "image";
  }
  async process(file: File): Promise<string> {
    // TODO: call backend /extract/ocr endpoint
    throw new Error(`ImageOCRStrategy.process not yet implemented for ${file.name}`);
  }
}

/**
 * Context — selects and executes the appropriate strategy at runtime.
 */
export class DocumentProcessorContext {
  private strategies: DocumentProcessingStrategy[] = [
    new ExcelProcessingStrategy(),
    new WordProcessingStrategy(),
    new PDFProcessingStrategy(),
    new ImageOCRStrategy(),
  ];

  async process(file: File, format: DocumentFormat): Promise<string> {
    const strategy = this.strategies.find((s) => s.canHandle(format));
    if (!strategy) {
      throw new Error(`No processing strategy found for format: ${format}`);
    }
    return strategy.process(file);
  }
}

// ─────────────────────────────────────────────
// Adapter Pattern — DUA Output Formatting
// ─────────────────────────────────────────────

export interface DUAOutputAdapter {
  toParagraph(value: string): string;
  toTableCell(value: string): string;
  toLabel(key: string): string;
  toMonetaryValue(amount: number, currency: string): string;
}

/**
 * Adapter that converts raw extracted data into Word template structures.
 */
export class WordDUAAdapter implements DUAOutputAdapter {
  toParagraph(value: string): string {
    return value.trim();
  }

  toTableCell(value: string): string {
    return value.trim().replace(/\n/g, " ");
  }

  toLabel(key: string): string {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  toMonetaryValue(amount: number, currency: string): string {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency,
    }).format(amount);
  }
}

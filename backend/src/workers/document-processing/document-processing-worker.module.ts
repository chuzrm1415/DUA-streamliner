import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DocumentProcessingWorker } from './document-processing.worker';
import { DocumentParserContext, PdfParsingStrategy, DocxParsingStrategy, XlsxParsingStrategy, OcrParsingStrategy } from './document-parser.strategies';
import { DuaDocumentGenerator } from './dua-document.generator';
import { DOCUMENT_PROCESSING_QUEUE } from './queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({ name: DOCUMENT_PROCESSING_QUEUE }),
  ],
  providers: [
    DocumentProcessingWorker,
    DocumentParserContext,
    PdfParsingStrategy,
    DocxParsingStrategy,
    XlsxParsingStrategy,
    OcrParsingStrategy,
    DuaDocumentGenerator,
  ],
  exports: [DuaDocumentGenerator],
})
export class DocumentProcessingWorkerModule {}

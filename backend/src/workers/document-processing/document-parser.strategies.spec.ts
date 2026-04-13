import {
  PdfParsingStrategy,
  DocxParsingStrategy,
  XlsxParsingStrategy,
  OcrParsingStrategy,
} from '@/workers/document-processing/document-parser.strategies';

describe('Document Parsing Strategies', () => {
  describe('PdfParsingStrategy', () => {
    const strategy = new PdfParsingStrategy();

    it('handles PDF format', () => {
      expect(strategy.canHandle('PDF')).toBe(true);
    });

    it('does not handle DOCX', () => {
      expect(strategy.canHandle('DOCX')).toBe(false);
    });
  });

  describe('DocxParsingStrategy', () => {
    const strategy = new DocxParsingStrategy();

    it('handles DOCX format', () => {
      expect(strategy.canHandle('DOCX')).toBe(true);
    });

    it('does not handle PDF', () => {
      expect(strategy.canHandle('PDF')).toBe(false);
    });
  });

  describe('XlsxParsingStrategy', () => {
    const strategy = new XlsxParsingStrategy();

    it('handles XLSX format', () => {
      expect(strategy.canHandle('XLSX')).toBe(true);
    });

    it('does not handle IMAGE', () => {
      expect(strategy.canHandle('IMAGE')).toBe(false);
    });
  });

  describe('OcrParsingStrategy', () => {
    const strategy = new OcrParsingStrategy();

    it('handles IMAGE format', () => {
      expect(strategy.canHandle('IMAGE')).toBe(true);
    });

    it('does not handle PDF', () => {
      expect(strategy.canHandle('PDF')).toBe(false);
    });
  });
});

import { AiService } from '@/ai/ai.service';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '@/logger/app-logger.service';

const mockConfig = { get: jest.fn((key: string) => {
  const map: Record<string, any> = {
    'openAi.apiKey': 'test-key',
    'openAi.model': 'gpt-4o',
    'openAi.maxTokens': 1000,
    'openAi.temperature': 0.1,
  };
  return map[key];
}) } as unknown as ConfigService;

const mockLogger = {
  logEvent: jest.fn(),
  log: jest.fn(),
  error: jest.fn(),
} as unknown as AppLogger;

describe('AiService', () => {
  let service: AiService;

  beforeEach(() => {
    service = new AiService(mockConfig, mockLogger);
  });

  describe('mapToDuaFields', () => {
    it('maps extracted data to DuaField array', () => {
      const extracted = {
        supplierName: 'ACME Corp',
        supplierCountry: 'US',
        invoiceNumber: 'INV-001',
        invoiceDate: '2025-01-15',
        incoterms: 'FOB',
        currency: 'USD',
        totalValue: '10000',
        confidence: {
          supplierName: 'high',
          invoiceNumber: 'medium',
        },
      };

      const fields = service.mapToDuaFields(extracted);

      expect(fields).toHaveLength(9);
      expect(fields.find((f) => f.key === 'supplierName')?.value).toBe('ACME Corp');
      expect(fields.find((f) => f.key === 'supplierName')?.confidence).toBe('high');
      expect(fields.find((f) => f.key === 'invoiceNumber')?.confidence).toBe('medium');
    });

    it('marks missing required fields as low confidence', () => {
      const fields = service.mapToDuaFields({});
      const supplierField = fields.find((f) => f.key === 'supplierName');
      expect(supplierField?.value).toBe('');
      expect(supplierField?.confidence).toBe('low');
      expect(supplierField?.required).toBe(true);
    });

    it('marks all fields as editable', () => {
      const fields = service.mapToDuaFields({ supplierName: 'Test' });
      expect(fields.every((f) => f.editable)).toBe(true);
    });
  });
});

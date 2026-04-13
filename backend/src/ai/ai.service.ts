import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AppLogger } from '@/logger/app-logger.service';
import type { ExtractedData, DuaField, ConfidenceLevel } from '@/common/types';

const DUA_EXTRACTION_PROMPT = `
You are a customs document expert specializing in Costa Rican DUA (Documento Único Aduanero) declarations.

Extract the following fields from the provided document text and return ONLY valid JSON matching this schema:
{
  "supplierName": string | null,
  "supplierCountry": string | null,
  "invoiceNumber": string | null,
  "invoiceDate": string | null,  // ISO date format
  "incoterms": string | null,
  "currency": string | null,     // ISO 4217 code
  "totalValue": string | null,   // numeric string
  "freightCost": string | null,
  "insuranceCost": string | null,
  "products": [
    {
      "description": string,
      "quantity": string,
      "unitValue": string,
      "totalValue": string,
      "hsCode": string | null
    }
  ],
  "confidence": {
    "<fieldKey>": "high" | "medium" | "low"
  }
}

Rules:
- Use "high" confidence when the value is explicit and unambiguous.
- Use "medium" when the value is inferred or partially extracted.
- Use "low" when guessing or when the field is missing.
- Return null for fields that cannot be found.
- Do NOT include any text outside the JSON object.
`.trim();

@Injectable()
export class AiService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly maxTokens: number;
  private readonly temperature: number;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.apiKey = this.config.get<string>('openAi.apiKey') ?? '';
    this.model = this.config.get<string>('openAi.model') ?? 'gpt-4o';
    this.maxTokens = this.config.get<number>('openAi.maxTokens') ?? 4096;
    this.temperature = this.config.get<number>('openAi.temperature') ?? 0.1;
  }

  /**
   * Send extracted text to OpenAI for semantic DUA field extraction.
   * Returns structured data with per-field confidence levels.
   */
  async extractDuaFields(rawText: string, sessionId: string): Promise<ExtractedData> {
    this.logger.logEvent({
      type: 'AI_EXTRACTION_STARTED',
      sessionId,
      status: 'success',
    });

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: this.model,
          max_tokens: this.maxTokens,
          temperature: this.temperature,
          messages: [
            { role: 'system', content: DUA_EXTRACTION_PROMPT },
            {
              role: 'user',
              content: `Extract DUA fields from this document text:\n\n${rawText.slice(0, 12000)}`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60_000,
        },
      );

      const content: string = response.data.choices[0]?.message?.content ?? '{}';
      const parsed = JSON.parse(content);

      this.logger.logEvent({
        type: 'AI_EXTRACTION_COMPLETED',
        sessionId,
        status: 'success',
      });

      return parsed as ExtractedData;
    } catch (err: any) {
      this.logger.logEvent({
        type: 'AI_EXTRACTION_FAILED',
        sessionId,
        status: 'failure',
        error: err.message,
      });
      // Graceful degradation — return empty data, fields will be marked low confidence
      return {};
    }
  }

  /**
   * Map extracted data + confidence map into DuaField array.
   */
  mapToDuaFields(extracted: ExtractedData): DuaField[] {
    const confidence = (extracted.confidence as Record<string, ConfidenceLevel>) ?? {};

    const scalar: { key: string; label: string; required: boolean }[] = [
      { key: 'supplierName', label: 'Supplier Name', required: true },
      { key: 'supplierCountry', label: 'Country of Origin', required: true },
      { key: 'invoiceNumber', label: 'Invoice Number', required: true },
      { key: 'invoiceDate', label: 'Invoice Date', required: true },
      { key: 'incoterms', label: 'Incoterms', required: true },
      { key: 'currency', label: 'Currency', required: true },
      { key: 'totalValue', label: 'Total Value', required: true },
      { key: 'freightCost', label: 'Freight Cost', required: false },
      { key: 'insuranceCost', label: 'Insurance Cost', required: false },
    ];

    return scalar.map(({ key, label, required }) => {
      const value = extracted[key] as string | null;
      return {
        key,
        label,
        value: value ?? '',
        confidence: confidence[key] ?? (value ? 'medium' : 'low'),
        editable: true,
        required,
        userValidated: false,
      };
    });
  }
}

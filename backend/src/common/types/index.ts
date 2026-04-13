// ─────────────────────────────────────────────
// Confidence levels
// ─────────────────────────────────────────────
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// ─────────────────────────────────────────────
// DUA field structure (stored as JSON in DB)
// ─────────────────────────────────────────────
export interface DuaField {
  key: string;
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  editable: boolean;
  required: boolean;
  userValidated?: boolean;
}

// ─────────────────────────────────────────────
// Extracted document data (intermediate)
// ─────────────────────────────────────────────
export interface ExtractedData {
  supplierName?: string;
  supplierCountry?: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  incoterms?: string;
  currency?: string;
  totalValue?: string;
  freightCost?: string;
  insuranceCost?: string;
  products?: ExtractedProduct[];
  [key: string]: unknown;
}

export interface ExtractedProduct {
  description: string;
  quantity: string;
  unitValue: string;
  totalValue: string;
  hsCode?: string;
}

// ─────────────────────────────────────────────
// Queue job payload
// ─────────────────────────────────────────────
export interface DocumentProcessingJobPayload {
  sessionId: string;
  userId: string;
  documentIds: string[];
}

// ─────────────────────────────────────────────
// API response wrapper
// ─────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

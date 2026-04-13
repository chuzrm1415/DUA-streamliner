import type { UserRole } from "@/lib/permissions";

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────
export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// ─────────────────────────────────────────────
// Confidence level for DUA field validation
// ─────────────────────────────────────────────
export type ConfidenceLevel = "high" | "medium" | "low";

export const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  high: "#22c55e",
  medium: "#eab308",
  low: "#ef4444",
};

// ─────────────────────────────────────────────
// Document
// ─────────────────────────────────────────────
export type DocumentFormat = "pdf" | "docx" | "xlsx" | "image";

export interface UploadedDocument {
  id: string;
  name: string;
  format: DocumentFormat;
  sizeBytes: number;
  status: "pending" | "processing" | "done" | "error";
}

// ─────────────────────────────────────────────
// DUA Fields
// ─────────────────────────────────────────────
export interface DUAField {
  key: string;
  label: string;
  value: string;
  confidence: ConfidenceLevel;
  editable: boolean;
  required: boolean;
}

export interface DUADocument {
  id: string;
  status: "preliminary" | "final";
  fields: DUAField[];
  generatedAt?: string;
}

// ─────────────────────────────────────────────
// Processing Session
// ─────────────────────────────────────────────
export type ProcessingStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "generating"
  | "review"
  | "completed"
  | "error";

export interface ProcessingSession {
  sessionId: string;
  status: ProcessingStatus;
  progress: number; // 0–100
  documents: UploadedDocument[];
  dua?: DUADocument;
  error?: string;
}

// ─────────────────────────────────────────────
// API Response wrapper
// ─────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
  details?: Record<string, string[]>;
}

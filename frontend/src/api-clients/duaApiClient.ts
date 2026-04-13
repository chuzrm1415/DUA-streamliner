import { apiRequest } from "./apiClient";
import type { DUADocument, ProcessingSession, ApiResponse } from "@/types";

// ─────────────────────────────────────────────
// Document Upload & Processing
// ─────────────────────────────────────────────

/**
 * Upload a folder of documents (multipart/form-data).
 * Returns a new ProcessingSession.
 */
export async function uploadDocumentFolder(
  files: File[],
  token: string
): Promise<ProcessingSession> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw await response.json();
  }

  return response.json();
}

/**
 * Start document processing for an existing session.
 */
export async function startProcessing(
  sessionId: string,
  token: string
): Promise<ProcessingSession> {
  return apiRequest<ProcessingSession>(
    `/sessions/${sessionId}/process`,
    { method: "POST", token }
  );
}

/**
 * Poll the current status of a processing session.
 */
export async function getSessionStatus(
  sessionId: string,
  token: string
): Promise<ProcessingSession> {
  return apiRequest<ProcessingSession>(
    `/sessions/${sessionId}`,
    { token }
  );
}

// ─────────────────────────────────────────────
// DUA Generation
// ─────────────────────────────────────────────

/**
 * Generate a preliminary DUA from a processed session.
 */
export async function generatePreliminaryDUA(
  sessionId: string,
  token: string
): Promise<DUADocument> {
  return apiRequest<DUADocument>(
    `/sessions/${sessionId}/dua/preliminary`,
    { method: "POST", token }
  );
}

/**
 * Submit corrected DUA fields and generate the final document.
 */
export async function generateFinalDUA(
  sessionId: string,
  fields: Record<string, string>,
  token: string
): Promise<ApiResponse<{ downloadUrl: string }>> {
  return apiRequest(
    `/sessions/${sessionId}/dua/final`,
    { method: "POST", body: { fields }, token }
  );
}

/**
 * Download the final DUA document (returns a Blob URL).
 */
export async function downloadDUA(
  sessionId: string,
  token: string
): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/sessions/${sessionId}/dua/download`,
    {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    }
  );

  if (!response.ok) throw await response.json();
  return response.blob();
}

"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProcessingStore } from "@/stores/processingStore";
import {
  uploadDocumentFolder,
  startProcessing,
  getSessionStatus,
  generatePreliminaryDUA,
  generateFinalDUA,
  downloadDUA,
} from "@/api-clients/duaApiClient";
import { useAuth } from "./useAuth";

const POLLING_INTERVAL_MS = 2000;

/**
 * Orchestrates the full DUA generation workflow.
 * Implements the Strategy Pattern: each step delegates to the appropriate service.
 */
export function useDUAProcessing() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const { session, setSession, setStatus, setProgress, setError, reset } =
    useProcessingStore();

  // ── Upload documents ──────────────────────────────────────────────────────
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadDocumentFolder(files, token!),
    onMutate: () => setStatus("uploading"),
    onSuccess: (data) => {
      setSession(data);
      setStatus("processing");
    },
    onError: (err: any) => setError(err.message ?? "Upload failed"),
  });

  // ── Poll processing status ────────────────────────────────────────────────
  useQuery({
    queryKey: ["session-status", session?.sessionId],
    queryFn: () => getSessionStatus(session!.sessionId, token!),
    enabled: !!session?.sessionId && session.status === "processing",
    refetchInterval: POLLING_INTERVAL_MS,
    select: (data) => {
      setSession(data);
      setProgress(data.progress);
      if (data.status === "generating") setStatus("generating");
      if (data.status === "review") setStatus("review");
      if (data.status === "error") setError(data.error ?? "Processing error");
      return data;
    },
  });

  // ── Generate preliminary DUA ──────────────────────────────────────────────
  const generatePreliminaryMutation = useMutation({
    mutationFn: () => generatePreliminaryDUA(session!.sessionId, token!),
    onMutate: () => setStatus("generating"),
    onSuccess: (dua) => {
      setSession({ ...session!, dua, status: "review" });
      setStatus("review");
    },
    onError: (err: any) => setError(err.message ?? "DUA generation failed"),
  });

  // ── Generate final DUA ────────────────────────────────────────────────────
  const generateFinalMutation = useMutation({
    mutationFn: (fields: Record<string, string>) =>
      generateFinalDUA(session!.sessionId, fields, token!),
    onSuccess: () => {
      setStatus("completed");
      queryClient.invalidateQueries({ queryKey: ["session-status"] });
    },
    onError: (err: any) => setError(err.message ?? "Final generation failed"),
  });

  // ── Download DUA ──────────────────────────────────────────────────────────
  const downloadMutation = useMutation({
    mutationFn: () => downloadDUA(session!.sessionId, token!),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `DUA_${session!.sessionId}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (err: any) => setError(err.message ?? "Download failed"),
  });

  const startUpload = useCallback(
    (files: File[]) => uploadMutation.mutate(files),
    [uploadMutation]
  );

  const triggerProcessing = useCallback(() => {
    if (session?.sessionId) startProcessing(session.sessionId, token!);
  }, [session, token]);

  return {
    session,
    startUpload,
    triggerProcessing,
    generatePreliminary: generatePreliminaryMutation.mutate,
    generateFinal: generateFinalMutation.mutate,
    download: downloadMutation.mutate,
    reset,
    isUploading: uploadMutation.isPending,
    isGenerating: generatePreliminaryMutation.isPending,
    isFinalizing: generateFinalMutation.isPending,
    isDownloading: downloadMutation.isPending,
  };
}

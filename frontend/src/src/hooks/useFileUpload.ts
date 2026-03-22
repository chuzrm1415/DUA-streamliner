"use client";

import { useState, useCallback } from "react";
import { useDropzone, type DropzoneOptions } from "react-dropzone";

const ACCEPTED_FORMATS: DropzoneOptions["accept"] = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/tiff": [".tif", ".tiff"],
};

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB per file

interface UseFileUploadOptions {
  maxFiles?: number;
  onFilesAccepted?: (files: File[]) => void;
}

/**
 * Wraps react-dropzone with project-specific validation rules.
 * File type validation and size limits are enforced on the client side
 * (server-side validation is also required before processing).
 */
export function useFileUpload({
  maxFiles = 50,
  onFilesAccepted,
}: UseFileUploadOptions = {}) {
  const [files, setFiles] = useState<File[]>([]);
  const [rejectedFiles, setRejectedFiles] = useState<{ file: File; errors: string[] }[]>([]);

  const onDrop = useCallback(
    (accepted: File[], rejected: any[]) => {
      setFiles((prev) => [...prev, ...accepted]);
      setRejectedFiles(
        rejected.map((r) => ({
          file: r.file,
          errors: r.errors.map((e: any) => e.message),
        }))
      );
      onFilesAccepted?.(accepted);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxSize: MAX_FILE_SIZE_BYTES,
    maxFiles,
  });

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setRejectedFiles([]);
  }, []);

  return {
    files,
    rejectedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    removeFile,
    clearFiles,
    hasFiles: files.length > 0,
    fileCount: files.length,
  };
}

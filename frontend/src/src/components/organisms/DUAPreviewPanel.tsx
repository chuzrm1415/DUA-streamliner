"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { DUAFieldRow } from "@/components/molecules/DUAFieldRow";
import type { DUADocument } from "@/types";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/lib/permissions";

interface DUAPreviewPanelProps {
  dua: DUADocument;
  onFieldChange: (key: string, value: string) => void;
  onGenerateFinal: () => void;
  onDownload: () => void;
  isFinalizing?: boolean;
  isDownloading?: boolean;
}

/**
 * Organism – Full DUA document preview with editable fields and action buttons.
 * Confidence indicators are shown per-field (green / yellow / red).
 */
export function DUAPreviewPanel({
  dua,
  onFieldChange,
  onGenerateFinal,
  onDownload,
  isFinalizing,
  isDownloading,
}: DUAPreviewPanelProps) {
  const { can } = usePermissions();

  const lowConfidenceCount = dua.fields.filter((f) => f.confidence === "low").length;
  const hasRequiredEmpty = dua.fields.some((f) => f.required && !f.value);

  return (
    <Box className="flex flex-col gap-4">
      <Box className="flex items-center justify-between">
        <Typography variant="h6" fontWeight={600}>
          DUA Preview
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {dua.status === "final" ? "Final document" : "Preliminary — review required"}
        </Typography>
      </Box>

      {lowConfidenceCount > 0 && (
        <Alert severity="warning" variant="outlined">
          {lowConfidenceCount} field{lowConfidenceCount > 1 ? "s" : ""} require manual review.
        </Alert>
      )}

      <Divider />

      {/* Fields */}
      <Box className="flex flex-col">
        {dua.fields.map((field) => (
          <DUAFieldRow key={field.key} field={field} onChange={onFieldChange} />
        ))}
      </Box>

      <Divider />

      {/* Actions */}
      <Box className="flex gap-2 justify-end">
        {dua.status !== "final" && can(PERMISSIONS.GENERATE_FINAL_DUA) && (
          <Button
            variant="contained"
            startIcon={<CheckCircleIcon />}
            onClick={onGenerateFinal}
            disabled={isFinalizing || hasRequiredEmpty}
            loading={isFinalizing}
          >
            Generate Final DUA
          </Button>
        )}

        {dua.status === "final" && can(PERMISSIONS.DOWNLOAD_DUA) && (
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={onDownload}
            disabled={isDownloading}
            loading={isDownloading}
          >
            Download (.docx)
          </Button>
        )}
      </Box>
    </Box>
  );
}

"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DUAPreviewPanel } from "@/components/organisms/DUAPreviewPanel";
import { useDUAProcessing } from "@/hooks/useDUAProcessing";

/**
 * Page – DUA review, field correction, final generation and download.
 * Orchestrates steps 6–8 of the core business process.
 */
export default function DUAPreviewPage() {
  const router = useRouter();
  const { session, generateFinal, download, isFinalizing, isDownloading, reset } =
    useDUAProcessing();

  // Local override map for edited field values
  const [fieldOverrides, setFieldOverrides] = useState<Record<string, string>>({});

  const dua = session?.dua;

  if (!dua) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-64 gap-4">
        <Typography variant="body1" color="text.secondary">
          No DUA document found. Please start a new processing session.
        </Typography>
        <Button component={Link} href="/protected/document-processing" variant="contained">
          Start New Session
        </Button>
      </Box>
    );
  }

  const handleFieldChange = (key: string, value: string) => {
    setFieldOverrides((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerateFinal = () => {
    generateFinal(fieldOverrides);
  };

  const handleNewSession = () => {
    reset();
    router.push("/protected/document-processing");
  };

  // Merge original fields with user overrides
  const mergedDua = {
    ...dua,
    fields: dua.fields.map((f) => ({
      ...f,
      value: fieldOverrides[f.key] ?? f.value,
    })),
  };

  return (
    <Box className="flex flex-col gap-4">
      {/* Header */}
      <Box className="flex items-center gap-3">
        <Button
          component={Link}
          href="/protected/document-processing"
          startIcon={<ArrowBackIcon />}
          size="small"
        >
          Back
        </Button>
        <Typography variant="h4" fontWeight={700}>
          DUA Preview
        </Typography>
      </Box>

      {/* Split layout: preview (left) + actions (right on large screens) */}
      <Box className="flex flex-col lg:flex-row gap-4">
        {/* Main preview panel */}
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <DUAPreviewPanel
              dua={mergedDua}
              onFieldChange={handleFieldChange}
              onGenerateFinal={handleGenerateFinal}
              onDownload={download}
              isFinalizing={isFinalizing}
              isDownloading={isDownloading}
            />
          </CardContent>
        </Card>

        {/* Side panel — session info & new session */}
        <Box className="flex flex-col gap-3 lg:w-64">
          <Card>
            <CardContent>
              <Typography variant="overline" color="text.secondary">
                Session
              </Typography>
              <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                {session?.sessionId}
              </Typography>
            </CardContent>
          </Card>

          <Button variant="outlined" color="secondary" fullWidth onClick={handleNewSession}>
            Start New Session
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

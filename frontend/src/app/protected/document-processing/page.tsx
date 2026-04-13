"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Divider from "@mui/material/Divider";
import { useRouter } from "next/navigation";
import { FileDropzone } from "@/components/molecules/FileDropzone";
import { StatusIndicator } from "@/components/atoms/StatusIndicator";
import { useDUAProcessing } from "@/hooks/useDUAProcessing";
import { useUIStore } from "@/stores/uiStore";

const STEPS = [
  "Select Documents",
  "Process",
  "Review DUA",
  "Generate Final",
];

/**
 * Page – Document upload and processing flow.
 * Orchestrates steps 3–5 of the core business process.
 */
export default function DocumentProcessingPage() {
  const router = useRouter();
  const { activeStep, setActiveStep } = useUIStore();
  const {
    session,
    startUpload,
    generatePreliminary,
    isUploading,
    isGenerating,
  } = useDUAProcessing();

  const handleFilesChange = (files: File[]) => {
    // Store in local state until user clicks "Start Processing"
  };

  const handleStartProcessing = (files: File[]) => {
    startUpload(files);
    setActiveStep(1);
  };

  const handleGoToReview = () => {
    generatePreliminary();
    router.push("/protected/dua-preview");
  };

  return (
    <Box className="flex flex-col gap-6">
      <Typography variant="h4" fontWeight={700}>
        Generate DUA
      </Typography>

      {/* Progress stepper */}
      <Stepper activeStep={activeStep} alternativeLabel>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {/* Step 0 — Upload */}
          {activeStep === 0 && (
            <UploadStep
              onStart={handleStartProcessing}
              onFilesChange={handleFilesChange}
            />
          )}

          {/* Step 1 — Processing */}
          {activeStep === 1 && session && (
            <ProcessingStep
              session={session}
              onContinue={handleGoToReview}
              isGenerating={isGenerating}
            />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function UploadStep({
  onStart,
  onFilesChange,
}: {
  onStart: (files: File[]) => void;
  onFilesChange: (files: File[]) => void;
}) {
  const [localFiles, setLocalFiles] = [[] as File[], (f: File[]) => {}];
  // TODO: replace with useState when wiring up
  return (
    <Box className="flex flex-col gap-4">
      <Typography variant="h6">Step 1 — Upload Documents</Typography>
      <Typography variant="body2" color="text.secondary">
        Upload the folder containing all required documents (PDF, DOCX, XLSX, images).
      </Typography>
      <FileDropzone onFilesChange={onFilesChange} />
      <Divider />
      <Box className="flex justify-end">
        <Button variant="contained" onClick={() => onStart([])}>
          Start Processing
        </Button>
      </Box>
    </Box>
  );
}

function ProcessingStep({
  session,
  onContinue,
  isGenerating,
}: {
  session: any;
  onContinue: () => void;
  isGenerating: boolean;
}) {
  const isDone = session.status === "review";
  return (
    <Box className="flex flex-col gap-4">
      <Typography variant="h6">Step 2 — Processing</Typography>
      <StatusIndicator status={session.status} progress={session.progress} />
      <Divider />
      <Box className="flex justify-end">
        <Button
          variant="contained"
          onClick={onContinue}
          disabled={!isDone || isGenerating}
        >
          Review DUA
        </Button>
      </Box>
    </Box>
  );
}

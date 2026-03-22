import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import type { ProcessingStatus } from "@/types";

interface StatusIndicatorProps {
  status: ProcessingStatus;
  progress?: number;
  message?: string;
}

const STATUS_LABELS: Record<ProcessingStatus, string> = {
  idle: "Ready",
  uploading: "Uploading documents…",
  processing: "Processing documents…",
  generating: "Generating DUA…",
  review: "Ready for review",
  completed: "Completed",
  error: "Error",
};

/**
 * Atom – Displays current processing status with optional progress bar.
 */
export function StatusIndicator({ status, progress, message }: StatusIndicatorProps) {
  const isActive = ["uploading", "processing", "generating"].includes(status);

  return (
    <Box className="flex flex-col gap-2">
      <Box className="flex items-center gap-2">
        {isActive && <CircularProgress size={16} thickness={5} />}
        <Typography variant="body2" color={status === "error" ? "error" : "text.secondary"}>
          {message ?? STATUS_LABELS[status]}
        </Typography>
      </Box>

      {isActive && progress !== undefined && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ borderRadius: 2, height: 6 }}
        />
      )}
    </Box>
  );
}

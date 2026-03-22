import Chip from "@mui/material/Chip";
import type { ConfidenceLevel } from "@/types";
import { CONFIDENCE_COLORS } from "@/types";

interface ConfidenceBadgeProps {
  level: ConfidenceLevel;
  size?: "small" | "medium";
}

const LABELS: Record<ConfidenceLevel, string> = {
  high: "High",
  medium: "Medium",
  low: "Review",
};

/**
 * Atom – Visual indicator for DUA field confidence level.
 * Green = High, Yellow = Medium, Red = Requires Review.
 */
export function ConfidenceBadge({ level, size = "small" }: ConfidenceBadgeProps) {
  return (
    <Chip
      label={LABELS[level]}
      size={size}
      sx={{
        backgroundColor: CONFIDENCE_COLORS[level],
        color: "#fff",
        fontWeight: 600,
        fontSize: size === "small" ? "0.7rem" : "0.85rem",
      }}
    />
  );
}

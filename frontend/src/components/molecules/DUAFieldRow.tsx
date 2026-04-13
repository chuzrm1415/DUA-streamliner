"use client";

import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ConfidenceBadge } from "@/components/atoms/ConfidenceBadge";
import type { DUAField } from "@/types";

interface DUAFieldRowProps {
  field: DUAField;
  onChange?: (key: string, value: string) => void;
}

/**
 * Molecule – Renders a single DUA field with its confidence badge.
 * Editable fields show a text input; read-only fields show plain text.
 */
export function DUAFieldRow({ field, onChange }: DUAFieldRowProps) {
  return (
    <Box
      className="flex items-start gap-3 py-2"
      sx={{ borderBottom: "1px solid", borderColor: "grey.100" }}
    >
      {/* Label column */}
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="body2" fontWeight={500} color="text.secondary">
          {field.label}
          {field.required && (
            <Typography component="span" color="error" sx={{ ml: 0.5 }}>
              *
            </Typography>
          )}
        </Typography>
      </Box>

      {/* Value column */}
      <Box className="flex-1">
        {field.editable ? (
          <TextField
            value={field.value}
            onChange={(e) => onChange?.(field.key, e.target.value)}
            fullWidth
            size="small"
            error={field.confidence === "low" && !field.value}
            helperText={
              field.confidence === "low" && !field.value ? "Required field needs review" : undefined
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                borderLeft: "3px solid",
                borderLeftColor:
                  field.confidence === "high"
                    ? "success.main"
                    : field.confidence === "medium"
                    ? "warning.main"
                    : "error.main",
              },
            }}
          />
        ) : (
          <Typography variant="body2">{field.value || "—"}</Typography>
        )}
      </Box>

      {/* Confidence badge column */}
      <Box sx={{ pt: 0.5 }}>
        <ConfidenceBadge level={field.confidence} />
      </Box>
    </Box>
  );
}

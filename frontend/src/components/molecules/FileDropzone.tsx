"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useFileUpload } from "@/hooks/useFileUpload";
import { formatFileSize } from "@/utils";

interface FileDropzoneProps {
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

/**
 * Molecule – Drag-and-drop file uploader built on react-dropzone.
 * Accepts PDF, DOCX, XLSX, and image files up to 50 MB each.
 */
export function FileDropzone({ onFilesChange, maxFiles, disabled }: FileDropzoneProps) {
  const { files, rejectedFiles, getRootProps, getInputProps, isDragActive, removeFile } =
    useFileUpload({
      maxFiles,
      onFilesAccepted: (accepted) => {
        // Merge with existing files list handled inside hook; pass all files up
        onFilesChange(accepted);
      },
    });

  return (
    <Box className="flex flex-col gap-3">
      {/* Drop zone */}
      <Box
        {...getRootProps()}
        sx={{
          border: "2px dashed",
          borderColor: isDragActive ? "primary.main" : "grey.300",
          borderRadius: 2,
          p: 4,
          textAlign: "center",
          cursor: disabled ? "not-allowed" : "pointer",
          backgroundColor: isDragActive ? "primary.50" : "background.paper",
          transition: "all 0.2s",
          "&:hover": disabled ? {} : { borderColor: "primary.light", backgroundColor: "grey.50" },
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <input {...getInputProps()} disabled={disabled} />
        <CloudUploadIcon sx={{ fontSize: 40, color: "primary.light", mb: 1 }} />
        <Typography variant="body1" fontWeight={500}>
          {isDragActive ? "Drop files here…" : "Drag & drop files or click to browse"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          PDF, DOCX, XLSX, PNG, JPG, TIFF · Max 50 MB per file
        </Typography>
      </Box>

      {/* Accepted files list */}
      {files.length > 0 && (
        <List dense disablePadding>
          {files.map((file, idx) => (
            <ListItem
              key={`${file.name}-${idx}`}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => removeFile(idx)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
              sx={{ borderRadius: 1, "&:hover": { backgroundColor: "grey.50" } }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <InsertDriveFileIcon fontSize="small" color="action" />
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={formatFileSize(file.size)}
                primaryTypographyProps={{ variant: "body2", noWrap: true }}
                secondaryTypographyProps={{ variant: "caption" }}
              />
            </ListItem>
          ))}
        </List>
      )}

      {/* Rejected files */}
      {rejectedFiles.length > 0 && (
        <Box>
          {rejectedFiles.map(({ file, errors }, idx) => (
            <Typography key={idx} variant="caption" color="error" display="block">
              {file.name}: {errors.join(", ")}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

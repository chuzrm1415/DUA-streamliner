import { z } from "zod";

// ─────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// ─────────────────────────────────────────────
// DUA Review / Edit
// ─────────────────────────────────────────────
export const duaFieldSchema = z.object({
  value: z.string().min(1, "This field is required"),
});

export const duaFormSchema = z.record(z.string(), z.string());
export type DUAFormValues = z.infer<typeof duaFormSchema>;

// ─────────────────────────────────────────────
// File upload
// ─────────────────────────────────────────────
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/tiff",
];

export const fileSchema = z
  .instanceof(File)
  .refine((f) => ALLOWED_MIME_TYPES.includes(f.type), {
    message: "Unsupported file type",
  })
  .refine((f) => f.size <= 50 * 1024 * 1024, {
    message: "File must be under 50 MB",
  });

export const fileListSchema = z
  .array(fileSchema)
  .min(1, "At least one file is required");

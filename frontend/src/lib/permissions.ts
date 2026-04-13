// ─────────────────────────────────────────────
// Roles
// ─────────────────────────────────────────────
export const ROLES = {
  MANAGER: "Manager",
  CUSTOMS_AGENT: "CustomsAgent",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

// ─────────────────────────────────────────────
// Permission Codes
// ─────────────────────────────────────────────
export const PERMISSIONS = {
  // Manager-only
  MANAGE_USERS: "MANAGE_USERS",
  VIEW_REPORTS: "VIEW_REPORTS",
  EDIT_TEMPLATES: "EDIT_TEMPLATES",

  // Customs Agent
  UPLOAD_FILES: "UPLOAD_FILES",
  PROCESS_DOCUMENTS: "PROCESS_DOCUMENTS",
  REVIEW_DUA: "REVIEW_DUA",
  GENERATE_FINAL_DUA: "GENERATE_FINAL_DUA",
  DOWNLOAD_DUA: "DOWNLOAD_DUA",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─────────────────────────────────────────────
// Role → Permission mapping
// ─────────────────────────────────────────────
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [ROLES.MANAGER]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.EDIT_TEMPLATES,
  ],
  [ROLES.CUSTOMS_AGENT]: [
    PERMISSIONS.UPLOAD_FILES,
    PERMISSIONS.PROCESS_DOCUMENTS,
    PERMISSIONS.REVIEW_DUA,
    PERMISSIONS.GENERATE_FINAL_DUA,
    PERMISSIONS.DOWNLOAD_DUA,
  ],
};

/**
 * Returns true if the given role has the requested permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

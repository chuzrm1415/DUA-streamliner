"use client";

import { useAuth } from "./useAuth";
import { hasPermission, type Permission } from "@/lib/permissions";

interface UsePermissionsReturn {
  can: (permission: Permission) => boolean;
  role: ReturnType<typeof useAuth>["role"];
}

/**
 * Returns a `can(permission)` helper based on the current user's role.
 *
 * @example
 * const { can } = usePermissions();
 * if (can(PERMISSIONS.GENERATE_FINAL_DUA)) { ... }
 */
export function usePermissions(): UsePermissionsReturn {
  const { role } = useAuth();

  return {
    role,
    can: (permission: Permission) => {
      if (!role) return false;
      return hasPermission(role, permission);
    },
  };
}

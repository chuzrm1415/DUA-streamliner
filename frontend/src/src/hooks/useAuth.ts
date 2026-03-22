"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import type { AppUser } from "@/types";
import type { UserRole } from "@/lib/permissions";

interface UseAuthReturn {
  user: AppUser | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Provides access to the current session, user info, and auth actions.
 */
export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  const user: AppUser | null = session?.user
    ? {
        id: (session.user as any).id ?? "",
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        role: (session.user as any).role,
      }
    : null;

  return {
    user,
    role: user?.role ?? null,
    token: (session as any)?.accessToken ?? null,
    isAuthenticated,
    isLoading,
    login: () => signIn("microsoft-entra-id"),
    logout: () => signOut({ callbackUrl: "/auth/login" }),
  };
}

"use client";

import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface AuthProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

/**
 * Wraps the app with NextAuth SessionProvider.
 * Use in the root layout to make session available to all client components.
 */
export function AuthProvider({ children, session }: AuthProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}

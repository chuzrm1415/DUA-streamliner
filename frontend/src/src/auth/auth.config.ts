import NextAuth from "next-auth";
import AzureAD from "next-auth/providers/microsoft-entra-id";
import type { NextAuthConfig } from "next-auth";
import { ROLES, type UserRole } from "@/lib/permissions";

export const authConfig: NextAuthConfig = {
  providers: [
    AzureAD({
      clientId: process.env.AUTH_AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AUTH_AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AUTH_AZURE_AD_TENANT_ID!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      },
    },
  },
  callbacks: {
    async jwt({ token, profile }) {
      // Map Azure AD roles to application roles on first sign-in
      if (profile) {
        const azureRoles: string[] = (profile as any).roles ?? [];
        token.role = mapAzureRoleToAppRole(azureRoles);
      }
      return token;
    },
    async session({ session, token }) {
      if (token.role) {
        session.user.role = token.role as UserRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
};

function mapAzureRoleToAppRole(azureRoles: string[]): UserRole {
  if (azureRoles.includes("Manager")) return ROLES.MANAGER;
  if (azureRoles.includes("CustomsAgent")) return ROLES.CUSTOMS_AGENT;
  return ROLES.CUSTOMS_AGENT; // default
}

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

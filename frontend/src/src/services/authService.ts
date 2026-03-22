import { signIn, signOut } from "next-auth/react";

/**
 * Abstraction layer over NextAuth client actions.
 * Components should use this instead of calling NextAuth directly.
 */
export const authService = {
  /**
   * Initiates SSO login via Azure Entra ID.
   */
  login(callbackUrl = "/protected/dashboard") {
    return signIn("microsoft-entra-id", { callbackUrl });
  },

  /**
   * Signs the user out and redirects to the login page.
   */
  logout() {
    return signOut({ callbackUrl: "/auth/login" });
  },
};

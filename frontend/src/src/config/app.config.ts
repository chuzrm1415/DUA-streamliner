/**
 * Centralised access to environment variables.
 * Server-only values (no NEXT_PUBLIC_ prefix) must only be imported in
 * Server Components or API routes.
 */

export const appConfig = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  appInsightsConnectionString: process.env.NEXT_PUBLIC_APP_INSIGHTS_CONNECTION_STRING ?? "",
} as const;

/** Server-side only config */
export const serverConfig = {
  azureKeyVaultUrl: process.env.AZURE_KEY_VAULT_URL ?? "",
} as const;

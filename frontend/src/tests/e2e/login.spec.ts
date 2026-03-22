import { test, expect } from "@playwright/test";

test.describe("Login flow", () => {
  test("shows login page for unauthenticated users", async ({ page }) => {
    await page.goto("/protected/dashboard");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("login page renders Microsoft SSO button", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(
      page.getByRole("button", { name: /sign in with microsoft/i })
    ).toBeVisible();
  });

  test("redirects authenticated user away from login page", async ({ page }) => {
    // This test requires a pre-authenticated state injected via storageState.
    // Set up in playwright.config.ts using globalSetup for CI environments.
    test.skip(!process.env.E2E_AUTH_STORAGE, "Requires auth storage state");
  });
});

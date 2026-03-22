import { test, expect } from "@playwright/test";

// NOTE: These tests require a valid authenticated session.
// Configure storageState in playwright.config.ts for CI.
test.describe("DUA generation flow", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.E2E_AUTH_STORAGE, "Requires auth storage state");
    await page.goto("/protected/dashboard");
  });

  test("dashboard shows Generate DUA button", async ({ page }) => {
    await expect(
      page.getByRole("link", { name: /generate dua/i })
    ).toBeVisible();
  });

  test("navigates to document processing page on CTA click", async ({ page }) => {
    await page.getByRole("link", { name: /generate dua/i }).click();
    await expect(page).toHaveURL(/\/protected\/document-processing/);
  });

  test("file dropzone is visible on processing page", async ({ page }) => {
    await page.goto("/protected/document-processing");
    await expect(
      page.getByText(/drag & drop files or click to browse/i)
    ).toBeVisible();
  });
});

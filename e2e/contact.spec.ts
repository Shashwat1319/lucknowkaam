import { test, expect } from "@playwright/test";

test.describe("Contact Page", () => {
  test("loads contact form", async ({ page }) => {
    await page.goto("/contact");
    await expect(page.locator("h1")).toContainText("संपर्क करें");
    await expect(page.locator('button:has-text("संदेश भेजें")')).toBeVisible();
  });

  test("submitting empty form shows validation errors", async ({ page }) => {
    await page.goto("/contact");
    await page.click('button:has-text("संदेश भेजें")');
    await expect(page.locator('input:invalid')).toHaveCount(2);
  });
});

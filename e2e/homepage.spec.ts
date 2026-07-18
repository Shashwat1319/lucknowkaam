import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads and displays main heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("भारत में नौकरी खोजें");
  });

  test("displays search bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('input[placeholder*="नौकरी खोजें"]')).toBeVisible();
  });

  test("search form navigates to /jobs with query", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[placeholder*="नौकरी खोजें"]', "डिलीवरी");
    await page.click('button:has-text("खोजें")');
    await expect(page).toHaveURL(/\/jobs\?q=.*डिलीवरी/);
  });
});

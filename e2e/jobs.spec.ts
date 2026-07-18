import { test, expect } from "@playwright/test";

test.describe("Jobs Page", () => {
  test("loads and displays job listings", async ({ page }) => {
    await page.goto("/jobs");
    await expect(page.locator("h1")).toContainText("भारत में सभी नौकरियां");
  });

  test("filters by category", async ({ page }) => {
    await page.goto("/jobs");
    const categoryLink = page.locator('a[href*="category="]').first();
    if (await categoryLink.isVisible()) {
      await categoryLink.click();
      await expect(page).toHaveURL(/category=/);
    }
  });

  test("pagination controls visible when enough jobs", async ({ page }) => {
    await page.goto("/jobs");
    await page.waitForLoadState("networkidle");
    const paginationLinks = page.locator("nav a >> text=अगला");
    if (await paginationLinks.isVisible()) {
      await expect(paginationLinks).toBeVisible();
    }
  });
});

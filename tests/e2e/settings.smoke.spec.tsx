import { expect, test } from "@playwright/test";
import { createConsoleBudget, enableWelcomeBypass } from "./helpers";

test("settings smoke: data and room controls are visible", async ({ page }) => {
  const budgets = createConsoleBudget(page);
  await enableWelcomeBypass(page);

  await page.goto("/settings");

  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Data" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export ZIP" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Rooms" })).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCSS("flex-direction", "row");
  await expect(page.getByRole("navigation")).toHaveCSS("flex-wrap", "wrap");

  const sectionRule = page.getByRole("heading", { name: "Settings" }).locator("span").first();
  await expect(sectionRule).toBeVisible();
  await expect(sectionRule).toHaveCSS("width", "1px");
  await expect(sectionRule).toHaveCSS("height", "20px");

  const settingsSubsection = page.locator(".settings-subsection").first();
  await expect(settingsSubsection).toBeVisible();

  const storageHealthHeading = page.getByRole("heading", { name: "Storage health" });
  const importReplaceButton = page.getByRole("button", { name: "Import (replace)..." });
  const [storageHealthBox, importReplaceBox] = await Promise.all([
    storageHealthHeading.boundingBox(),
    importReplaceButton.boundingBox(),
  ]);

  expect(storageHealthBox).not.toBeNull();
  expect(importReplaceBox).not.toBeNull();
  expect(storageHealthBox!.y - (importReplaceBox!.y + importReplaceBox!.height)).toBeGreaterThan(
    8,
  );

  budgets.assert();
});

test("settings smoke: mobile content scrolls without clipping", async ({ page }) => {
  const budgets = createConsoleBudget(page);
  await enableWelcomeBypass(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/settings");

  const main = page.locator("main");
  const mainCanScroll = await main.evaluate((element) => element.scrollHeight > element.clientHeight);
  expect(mainCanScroll).toBe(true);

  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });

  await expect(page.getByRole("heading", { name: "Keyboard" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Seed graph test data with images" })).toBeVisible();

  budgets.assert();
});

test("settings smoke: seed flow reports 70 generated images", async ({ page }) => {
  const budgets = createConsoleBudget(page);
  await enableWelcomeBypass(page);

  await page.goto("/settings");

  await page.getByRole("button", { name: "Seed graph test data with images" }).click();
  await page.getByRole("button", { name: "Seed data" }).click();

  await expect(page.getByText(/with 70 images/i)).toBeVisible({ timeout: 60_000 });

  budgets.assert();
});

test("settings visual: desktop spacing and alignment drift", async ({ page }) => {
  const budgets = createConsoleBudget(page);
  await page.addInitScript(() => {
    localStorage.setItem("bp-theme", "dark");
  });
  await enableWelcomeBypass(page);

  await page.goto("/settings");

  await expect(page).toHaveScreenshot("settings-desktop.png", {
    fullPage: true,
    animations: "disabled",
  });

  budgets.assert();
});

test("settings visual: mobile spacing and alignment drift", async ({ page }) => {
  const budgets = createConsoleBudget(page);
  await page.addInitScript(() => {
    localStorage.setItem("bp-theme", "dark");
  });
  await enableWelcomeBypass(page);
  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto("/settings");

  await expect(page).toHaveScreenshot("settings-mobile.png", {
    fullPage: true,
    animations: "disabled",
  });

  budgets.assert();
});

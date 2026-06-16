import { expect, test } from "@playwright/test";
import { createConsoleBudget, enableWelcomeBypass } from "./helpers";

test("todos smoke: board shells and scope controls", async ({ page }) => {
  const budgets = createConsoleBudget(page);
  await enableWelcomeBypass(page);

  await page.goto("/todos");

  await expect(page.getByRole("heading", { name: "Todo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Open" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "In progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Done" })).toBeVisible();

  await page.getByRole("button", { name: "This run" }).click();
  await expect(page.getByRole("button", { name: "All" })).toBeVisible();
  await expect(page.getByText(/\d+ item|\d+ items/)).toBeVisible();

  budgets.assert();
});

test("todos smoke: mobile tabs switch single status column", async ({ page }) => {
  const budgets = createConsoleBudget(page);
  await enableWelcomeBypass(page);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/todos");

  await expect(page.getByRole("tab", { name: /Open/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: /In progress/ })).toBeVisible();
  await expect(page.getByRole("tab", { name: /Done/ })).toBeVisible();

  await expect(page.getByRole("heading", { name: "Open" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "In progress" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Done" })).toHaveCount(0);

  await page.getByRole("tab", { name: /In progress/ }).click();
  await expect(page.getByRole("heading", { name: "Open" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "In progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Done" })).toHaveCount(0);

  await page.getByRole("tab", { name: /Done/ }).click();
  await expect(page.getByRole("heading", { name: "Open" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "In progress" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Done" })).toBeVisible();

  budgets.assert();
});

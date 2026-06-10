import { expect, test } from "@playwright/test";
import { createConsoleBudget, createNoteWithImage, enableWelcomeBypass } from "./helpers";

test("notes smoke: create, edit, delete", async ({ page }) => {
  test.setTimeout(60_000);

  const uid = Date.now().toString(36);
  const baseTitle = `E2E smoke note ${uid}`;
  const editedTitle = `E2E smoke note edited ${uid}`;

  const budgets = createConsoleBudget(page);
  await enableWelcomeBypass(page);

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Blue Prince Notes" })).toBeVisible();

  await createNoteWithImage(page, baseTitle);

  const noteRow = page.locator(".note-row-item", { hasText: baseTitle }).first();
  await expect(noteRow).toBeVisible();

  await noteRow.getByRole("button", { name: "Edit note" }).click();
  await page.getByLabel("Title").first().fill(`${editedTitle} #smoke @entrance-hall`);
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.getByText(editedTitle, { exact: false }).first()).toBeVisible();

  const editedRow = page.locator(".note-row-item", { hasText: editedTitle }).first();
  await editedRow.getByRole("button", { name: "Delete note" }).click();
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.locator(".note-row-item", { hasText: editedTitle })).toHaveCount(0);

  budgets.assert();
});

test("welcome header: only theme toggle is visible before first action", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem("bp-welcomed");
    indexedDB.deleteDatabase("blue-prince-notes");
  });

  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Welcome to Blue Prince Journal" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Switch to (dark|light) theme/i })).toBeVisible();

  await expect(page.getByRole("button", { name: /Add note/i })).toHaveCount(0);
  await expect(page.getByLabel("Search")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Settings" })).toHaveCount(0);
  await expect(page.locator(".app-nav-link")).toHaveCount(0);
  await expect(page.locator(".header-sync-status")).toHaveCount(0);

  await page.getByRole("button", { name: "Start fresh" }).click();
  await expect(page.getByRole("button", { name: /Add note/i })).toBeVisible();
});

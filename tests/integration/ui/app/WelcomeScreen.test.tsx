import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";

const hoisted = vi.hoisted(() => ({
  mockImportAll: vi.fn(async () => {}),
  mockStartFresh: vi.fn(async () => {}),
  mockGetLocalJournalItemCount: vi.fn(async () => 0),
  mockConnectSyncFolderWithConflictResolution: vi.fn<
    () => Promise<{
      resolution: "connected-empty" | "use-folder-data" | "keep-local-data";
      handle: { name: string };
    } | null>
  >(async () => null),
  mockGetActiveFolderName: vi.fn(() => null as string | null),
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("@/data/storage/backup", () => ({
  importAll: hoisted.mockImportAll,
}));

vi.mock("@/data/mutations/lifecycleMutations", () => ({
  startFresh: hoisted.mockStartFresh,
}));

vi.mock("@/data/welcome", () => ({
  getLocalJournalItemCount: hoisted.mockGetLocalJournalItemCount,
}));

vi.mock("@/data/sync/sync", () => ({
  connectSyncFolderWithConflictResolution: hoisted.mockConnectSyncFolderWithConflictResolution,
  syncRuntime: { getActiveFolderName: hoisted.mockGetActiveFolderName },
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

describe("WelcomeScreen", () => {
  beforeEach(() => {
    hoisted.mockImportAll.mockClear();
    hoisted.mockStartFresh.mockClear();
    hoisted.mockGetLocalJournalItemCount.mockClear();
    hoisted.mockConnectSyncFolderWithConflictResolution.mockClear();
    hoisted.mockGetActiveFolderName.mockClear();
    toastSuccess.mockClear();
    toastError.mockClear();
  });

  it("shows continue option when suggested", () => {
    const onContinue = vi.fn();
    render(<WelcomeScreen onDone={vi.fn()} onContinue={onContinue} showContinueSuggestion />);

    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));
    expect(onContinue).toHaveBeenCalled();
  });

  it("starts fresh and calls onDone", async () => {
    const onDone = vi.fn();
    render(<WelcomeScreen onDone={onDone} />);

    fireEvent.click(screen.getByRole("button", { name: /Start fresh/i }));

    await waitFor(() => {
      expect(hoisted.mockStartFresh).toHaveBeenCalled();
      expect(toastSuccess).toHaveBeenCalledWith("Started fresh");
      expect(onDone).toHaveBeenCalled();
    });
  });

  it("handles start fresh failure", async () => {
    hoisted.mockStartFresh.mockRejectedValueOnce(new Error("fail"));
    render(<WelcomeScreen onDone={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Start fresh/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("Could not reset existing data");
    });
  });

  it("connects folder as empty and finishes onboarding", async () => {
    const onDone = vi.fn();
    hoisted.mockConnectSyncFolderWithConflictResolution.mockResolvedValueOnce({
      resolution: "connected-empty",
      handle: { name: "SyncDir" },
    });
    hoisted.mockGetActiveFolderName.mockReturnValueOnce("SyncDir");

    render(<WelcomeScreen onDone={onDone} />);
    fireEvent.click(screen.getByRole("button", { name: /Sync folder/i }));

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith(
        'Connected to "SyncDir" - data will sync here automatically',
      );
      expect(onDone).toHaveBeenCalledWith("SyncDir");
    });
  });

  it("connects folder using existing folder data", async () => {
    const onDone = vi.fn();
    hoisted.mockConnectSyncFolderWithConflictResolution.mockResolvedValueOnce({
      resolution: "use-folder-data",
      handle: { name: "SyncDir" },
    });
    hoisted.mockGetActiveFolderName.mockReturnValueOnce("SyncDir");

    render(<WelcomeScreen onDone={onDone} />);
    fireEvent.click(screen.getByRole("button", { name: /Sync folder/i }));

    await waitFor(() => {
      expect(toastSuccess).toHaveBeenCalledWith('Using folder data from "SyncDir"');
      expect(onDone).toHaveBeenCalledWith("SyncDir");
    });
  });

  it("handles restricted folder error", async () => {
    hoisted.mockConnectSyncFolderWithConflictResolution.mockRejectedValueOnce(
      new Error("Sensitive system files"),
    );
    render(<WelcomeScreen onDone={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /Sync folder/i }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(
        "That folder is restricted by the browser. Pick a normal folder instead.",
      );
    });
  });

  it("imports backup and finishes onboarding", async () => {
    const onDone = vi.fn();
    render(<WelcomeScreen onDone={onDone} />);

    const file = new File(["{}"], "backup.json", { type: "application/json" });
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(hoisted.mockImportAll).toHaveBeenCalledWith(file, "replace");
      expect(toastSuccess).toHaveBeenCalledWith("Data imported");
      expect(onDone).toHaveBeenCalled();
    });
  });

  it("handles import error message", async () => {
    hoisted.mockImportAll.mockRejectedValueOnce(new Error("zip invalid"));
    render(<WelcomeScreen onDone={vi.fn()} />);

    const file = new File(["bad"], "backup.json", { type: "application/json" });
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith("zip invalid");
    });
  });
});


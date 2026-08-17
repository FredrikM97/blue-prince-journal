import { fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "@/hooks/useStore";

const ctx = vi.hoisted(() => ({
  db: {
    notes: { count: vi.fn(async () => 0) },
    todos: { count: vi.fn(async () => 0) },
  },
  ensureBootSeed: vi.fn(async () => {}),
  cleanupOrphanedImageRefs: vi.fn(async () => {}),
  syncRuntime: {
    boot: vi.fn<
      (localIsEmpty: boolean) => Promise<{ folderName: string | null; appliedFolderData: boolean }>
    >(async () => ({ folderName: null, appliedFolderData: false })),
  },
}));

vi.mock("@/data/db", () => ({ db: ctx.db, ensureBootSeed: ctx.ensureBootSeed }));
vi.mock("@/data/mutations/imageMutations", () => ({
  cleanupOrphanedImageRefs: ctx.cleanupOrphanedImageRefs,
}));
vi.mock("@/data/sync/sync", () => ({ syncRuntime: ctx.syncRuntime }));

import { useAppFrameInit } from "@/hooks/useAppFrameInit";

describe("useAppFrameInit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.db.notes.count.mockResolvedValue(0);
    ctx.db.todos.count.mockResolvedValue(0);
    ctx.syncRuntime.boot.mockResolvedValue({ folderName: null, appliedFolderData: false });
    useStore.setState({ loaded: false, syncFolderName: null });
  });

  it("seeds, cleans up orphaned images and marks the app loaded", async () => {
    renderHook(() => useAppFrameInit());

    await waitFor(() => {
      expect(ctx.ensureBootSeed).toHaveBeenCalled();
      expect(ctx.cleanupOrphanedImageRefs).toHaveBeenCalled();
      expect(useStore.getState().loaded).toBe(true);
    });
  });

  it("boots sync with localIsEmpty=true when there is no local data", async () => {
    renderHook(() => useAppFrameInit());

    await waitFor(() => {
      expect(ctx.syncRuntime.boot).toHaveBeenCalledWith(true);
    });
  });

  it("boots sync with localIsEmpty=false when local data exists", async () => {
    ctx.db.notes.count.mockResolvedValue(1);
    renderHook(() => useAppFrameInit());

    await waitFor(() => {
      expect(ctx.syncRuntime.boot).toHaveBeenCalledWith(false);
    });
  });

  it("stores the restored sync folder name", async () => {
    ctx.syncRuntime.boot.mockResolvedValueOnce({
      folderName: "RecoveredSync",
      appliedFolderData: true,
    });

    renderHook(() => useAppFrameInit());

    await waitFor(() => {
      expect(useStore.getState().syncFolderName).toBe("RecoveredSync");
    });
  });
});

vi.mock("@/components/welcome/WelcomeScreen", () => ({
  WelcomeScreen: ({
    onDone,
    onContinue,
    showContinueSuggestion,
  }: {
    onDone: (folderName?: string) => void;
    onContinue?: () => void;
    showContinueSuggestion?: boolean;
  }) => (
    <div data-testid="welcome-screen">
      <div data-testid="continue-suggestion">{showContinueSuggestion ? "yes" : "no"}</div>
      <button type="button" onClick={() => onContinue?.()}>
        continue
      </button>
      <button type="button" onClick={() => onDone("FromWelcome")}>
        done
      </button>
    </div>
  ),
}));

const mockNavigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>,
}));

vi.mock("@/components/app-header/ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));
vi.mock("@/routes/Sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

const mockAppData = vi.hoisted(() => ({
  notes: [] as Array<{ id: string }>,
  todos: [] as Array<{ id: string }>,
}));
vi.mock("@/hooks/useAppData", () => ({
  useAppData: () => mockAppData,
}));

import { WelcomeView } from "@/components/welcome/WelcomeView";

describe("WelcomeView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAppData.notes = [];
    mockAppData.todos = [];
    useStore.setState({ syncFolderName: null });
  });

  it("hides the continue suggestion for fresh users", () => {
    render(<WelcomeView />);
    expect(screen.getByTestId("continue-suggestion")).toHaveTextContent("no");
  });

  it("shows the continue suggestion when local notes exist", () => {
    mockAppData.notes = [{ id: "n1" }];
    render(<WelcomeView />);
    expect(screen.getByTestId("continue-suggestion")).toHaveTextContent("yes");
  });

  it("shows the continue suggestion when a sync folder is connected", () => {
    useStore.setState({ syncFolderName: "SyncDir" });
    render(<WelcomeView />);
    expect(screen.getByTestId("continue-suggestion")).toHaveTextContent("yes");
  });

  it("navigates to notes on continue", () => {
    render(<WelcomeView />);
    fireEvent.click(screen.getByRole("button", { name: "continue" }));
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/notes" });
  });

  it("navigates to notes when onboarding is done", () => {
    render(<WelcomeView />);
    fireEvent.click(screen.getByRole("button", { name: "done" }));
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/notes" });
  });
});

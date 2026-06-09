import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderRootLayoutWithProviders } from "../../helpers/renderWithProviders";

const ctx = vi.hoisted(() => ({
  sync: {
    syncRuntime: {
      boot: vi.fn<
        (
          localIsEmpty: boolean,
        ) => Promise<{ folderName: string | null; appliedFolderData: boolean }>
      >(async () => ({ folderName: null, appliedFolderData: false })),
      getActiveFolderName: vi.fn(() => null as string | null),
      subscribeStatus: vi.fn(() => () => {}),
      loadMode: vi.fn(async () => "auto" as const),
    },
    connectSyncFolderWithConflictResolution: vi.fn(async () => null),
    countLocalSyncItems: vi.fn(() => 0),
  },
  state: {
    load: vi.fn(async () => {}),
    loaded: false,
    notes: [] as Array<{ id: string }>,
    todos: [] as Array<{ id: string }>,
    setSyncFolderName: vi.fn(),
    sections: [] as Array<{
      id: string;
      label: string;
      builtin?: string;
      filter?: { type?: string };
    }>,
  },
}));

vi.mock("@/hooks/useStore", () => {
  const useStore = ((selector: (state: typeof ctx.state) => unknown) =>
    selector(ctx.state)) as typeof import("@/hooks/useStore").useStore;
  useStore.getState = () => ctx.state as never;
  return { useStore };
});
vi.mock("@/data/sync/sync", () => ctx.sync);
vi.mock("@/components/app-header/AppHeader", () => ({
  AppHeader: () => <div data-testid="app-header" />,
}));
vi.mock("@/routes/Sonner", () => ({
  Toaster: () => <div data-testid="toaster" />,
}));
vi.mock("@/components/notes/NotesPage", () => ({
  NotesPage: () => <div data-testid="notes-page" />,
}));
vi.mock("@/components/settings/SettingsPage", () => ({
  SettingsPage: () => <div data-testid="settings-page" />,
}));
vi.mock("@/components/todos/TodosPage", () => ({
  TodosPage: () => <div data-testid="todos-page" />,
}));
vi.mock("@/components/map/MapPage", () => ({
  MapPage: () => <div data-testid="map-page" />,
}));
vi.mock("@/components/images/ImagesPage", () => ({
  ImagesPage: () => <div data-testid="images-page" />,
}));
vi.mock("@/components/graph/GraphPage", () => ({
  GraphPage: () => <div data-testid="graph-page" />,
}));
vi.mock("@/hooks/useSuggestionSources", () => ({
  SuggestionSourcesContext: {
    Provider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  },
  useSuggestionSources: () => ({ roomSuggestions: [], tagSuggestions: [] }),
}));
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

vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Outlet: () => <div data-testid="router-outlet" />,
    HeadContent: () => null,
    Scripts: () => null,
    Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
      <a href={to}>{children}</a>
    ),
    useRouter: () => ({ invalidate: vi.fn() }),
  };
});

describe("router boot and welcome gating", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    ctx.state.loaded = false;
    ctx.state.notes = [];
    ctx.state.todos = [];
  });

  it("shows welcome screen for fresh users", async () => {
    renderRootLayoutWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("welcome-screen")).toBeInTheDocument();
    });
  });

  it("renders outlet when user already welcomed", async () => {
    localStorage.setItem("bp-welcomed", "1");

    renderRootLayoutWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("router-outlet")).toBeInTheDocument();
    });
  });

  it("restores sync folder and imports when local store is empty", async () => {
    ctx.sync.syncRuntime.boot.mockResolvedValueOnce({
      folderName: "RecoveredSync",
      appliedFolderData: true,
    });

    renderRootLayoutWithProviders();

    await waitFor(() => {
      expect(ctx.state.setSyncFolderName).toHaveBeenCalledWith("RecoveredSync");
      expect(ctx.sync.syncRuntime.boot).toHaveBeenCalledWith(true); // localIsEmpty = true
      expect(ctx.state.load).toHaveBeenCalledTimes(2); // initial + after folder import
    });
  });

  it("transitions from welcome to ready on continue", async () => {
    renderRootLayoutWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("welcome-screen")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "continue" }));

    await waitFor(() => {
      expect(screen.getByTestId("router-outlet")).toBeInTheDocument();
    });
  });

  it("handles onboarding done callback and stores welcome flag", async () => {
    renderRootLayoutWithProviders();

    await waitFor(() => {
      expect(screen.getByTestId("welcome-screen")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "done" }));

    await waitFor(() => {
      expect(ctx.state.setSyncFolderName).toHaveBeenCalledWith("FromWelcome");
      expect(localStorage.getItem("bp-welcomed")).toBe("1");
      expect(screen.getByTestId("router-outlet")).toBeInTheDocument();
    });
  });
});

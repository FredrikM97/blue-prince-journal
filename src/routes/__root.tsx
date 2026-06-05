import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  HeadContent,
  Link,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Toaster } from "@/components/common/Sonner";
import { toast } from "sonner";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { NotesPage } from "@/components/notes/NotesPage";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { TodosPage } from "@/components/todos/TodosPage";
import { MapPage } from "@/components/map/MapPage";
import { ImagesPage } from "@/components/images/ImagesPage";
import { GraphPage } from "@/components/graph/GraphPage";
import { useStore } from "@/data/store";
import { syncRuntime } from "@/data/sync";
import { getLocalStorageFlag, setLocalStorageFlag } from "@/data/storageHealth";
import { db, ensureBootSeed } from "@/data/db";
import { cleanupOrphanedImageRefs } from "@/data/mutations";
import { useLiveQuery } from "dexie-react-hooks";
import type { Note, Todo, SectionDef } from "@/lib/types";

type RouterContext = {
  queryClient: QueryClient;
};

export function RootShellView({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function AppFrame({ children }: { children: React.ReactNode }) {
  const loaded = useStore((s) => s.loaded);
  const setLoaded = useStore((s) => s.setLoaded);
  const setSyncFolderName = useStore((s) => s.setSyncFolderName);
  const notes: Note[] = useLiveQuery(() => db.notes.toArray()) ?? [];
  const todos: Todo[] = useLiveQuery(() => db.todos.toArray()) ?? [];

  const [initState, setInitState] = useState<"checking" | "welcome" | "ready">("checking");
  const [welcomeSource, setWelcomeSource] = useState<"auto" | "manual" | null>(null);

  useEffect(() => {
    async function init() {
      try {
        await ensureBootSeed();
        await cleanupOrphanedImageRefs();
        setLoaded(true);

        const noteCount = await db.notes.count();
        const todoCount = await db.todos.count();
        const localIsEmpty = noteCount === 0 && todoCount === 0;
        const { folderName } = await syncRuntime.boot(localIsEmpty);
        if (folderName) setSyncFolderName(folderName);
        // If folder data was applied, useLiveQuery will reactively update

        const welcomed = getLocalStorageFlag("bp-welcomed");
        const hasData = (await db.notes.count()) > 0 || (await db.todos.count()) > 0;
        const hasSyncFolder = Boolean(syncRuntime.getActiveFolderName());

        if (!welcomed && !hasData && !hasSyncFolder) {
          setWelcomeSource("auto");
          setInitState("welcome");
          return;
        }

        setLocalStorageFlag("bp-welcomed");
        setWelcomeSource(null);
        setInitState("ready");
      } catch {
        setInitState("ready");
        toast.error(
          "Browser storage access is limited. Recent changes may not persist after refresh.",
        );
      }
    }

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function showWelcome() {
      setWelcomeSource("manual");
      setInitState("welcome");
    }
    window.addEventListener("bp:show-welcome", showWelcome);
    return () => window.removeEventListener("bp:show-welcome", showWelcome);
  }, []);

  // When a new version of the app is deployed, chunk URLs change. Instead of
  // crashing or silently breaking, show a persistent notification so users can
  // reload at their own convenience.
  useEffect(() => {
    function onPreloadError(e: Event) {
      e.preventDefault(); // prevent Vite from propagating the error
      toast("A new version is available", {
        description: "Reload the page to get the latest updates.",
        duration: Infinity,
        action: { label: "Reload", onClick: () => window.location.reload() },
      });
    }
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => window.removeEventListener("vite:preloadError", onPreloadError);
  }, []);

  const shouldAutoDismissWelcome =
    initState === "welcome" && welcomeSource === "auto" && (notes.length > 0 || todos.length > 0);

  useEffect(() => {
    if (!shouldAutoDismissWelcome) return;
    setLocalStorageFlag("bp-welcomed");
  }, [shouldAutoDismissWelcome]);

  const effectiveInitState = shouldAutoDismissWelcome ? "ready" : initState;

  if (!loaded && effectiveInitState === "checking") {
    return (
      <div className="app-shell">
        <AppHeader />
        <Toaster />
      </div>
    );
  }

  if (effectiveInitState === "welcome") {
    const hasExistingConfiguration =
      notes.length > 0 || todos.length > 0 || Boolean(syncRuntime.getActiveFolderName());

    return (
      <div className="app-shell">
        <AppHeader />
        <div className="min-h-0 flex-1 overflow-auto">
          <WelcomeScreen
            showContinueSuggestion={hasExistingConfiguration}
            onContinue={() => {
              setWelcomeSource(null);
              setInitState("ready");
            }}
            onDone={(folderName) => {
              if (folderName) setSyncFolderName(folderName);
              setLocalStorageFlag("bp-welcomed");
              setWelcomeSource(null);
              setInitState("ready");
            }}
          />
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <HeadContent />
      <AppHeader />
      <div className="app-page-container">{children}</div>
      <Toaster />
    </div>
  );
}

export function RootLayoutView({ queryClient }: { queryClient: QueryClient }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppFrame>
        <Outlet />
      </AppFrame>
    </QueryClientProvider>
  );
}

export function NotFoundView() {
  return (
    <div className="page-center">
      <div className="max-w-md text-center">
        <h1 className="text-7xl text-brass">404</h1>
        <h2 className="mt-4 text-xl">A door that doesn't open</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This room isn't on the map. Head back to the entrance hall.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex rounded-md bg-brass px-4 py-2 text-sm font-medium text-brass-foreground hover:bg-brass/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export function ErrorView({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="page-center">
      <div className="max-w-md text-center">
        <h1 className="text-xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-md bg-brass px-4 py-2 text-sm font-medium text-brass-foreground hover:bg-brass/90"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}

export function NotesIndexView() {
  return <NotesPage title="Notes" emptyHint="No notes yet. Press N anywhere to add one." />;
}

export function SectionView({ id }: { id: string }) {
  const sections: SectionDef[] = useLiveQuery(() => db.sections.toArray()) ?? [];
  const section = useMemo(() => sections.find((s) => s.id === id), [sections, id]);

  if (!section) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-muted-foreground">
        Section not found.
      </div>
    );
  }

  if (section.builtin === "todos") return <TodosPage />;
  if (section.builtin === "map") return <MapPage />;
  if (section.builtin === "graph") return <GraphPage />;
  if (section.builtin === "images") return <ImagesPage />;
  if (section.id === "settings") return <SettingsPage />;

  return <NotesPage filterType={section.filter?.type} title={section.label} />;
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
  shellComponent: RootShellView,
  component: () => <RootLayoutView queryClient={rootRoute.useRouteContext().queryClient} />,
  notFoundComponent: NotFoundView,
  errorComponent: ErrorView,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Blue Prince Journal" },
      {
        name: "description",
        content: "A keyboard-first journal and todos tracker for Blue Prince.",
      },
    ],
  }),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: NotesIndexView,
  head: () => ({
    meta: [
      { title: "Notes - Blue Prince Journal" },
      { name: "description", content: "All your Blue Prince notes, clues, codes and theories." },
    ],
  }),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "settings",
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings - Blue Prince Journal" }] }),
});

const sectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "section/$id",
  component: () => <SectionView id={sectionRoute.useParams().id} />,
  head: () => ({ meta: [{ title: "Section - Blue Prince Journal" }] }),
});

const routeTree = rootRoute.addChildren([indexRoute, settingsRoute, sectionRoute]);

export const getRouter = () => {
  const queryClient = new QueryClient();
  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
};

// Alias for routeTree.gen.ts file-based routing compatibility
export { rootRoute as Route };

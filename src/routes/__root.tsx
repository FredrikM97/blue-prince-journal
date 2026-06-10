import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  HeadContent,
  Link,
  Outlet,
  useRouterState,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { AppHeader } from "@/components/app-header/AppHeader";
import { ThemeToggle } from "@/components/app-header/ThemeToggle";
import { Toaster } from "@/routes/Sonner";
import { toast } from "sonner";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";
import { NotesPage } from "@/components/notes/NotesPage";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { TodosPage } from "@/components/todos/TodosPage";
import { MapPage } from "@/components/map/MapPage";
import { ImagesPage } from "@/components/images/ImagesPage";
import { GraphPage } from "@/components/graph/GraphPage";
import { useStore } from "@/hooks/useStore";
import { syncRuntime } from "@/data/sync/sync";
import { db } from "@/data/db";
import { useLiveQuery } from "dexie-react-hooks";
import type { Note, Todo, SectionDef } from "@/lib/types";
import { useAppFrameInit } from "@/hooks/useAppFrameInit";

type RouterContext = {
  queryClient: QueryClient;
};

export function RootShellView({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function WelcomeHeaderShell() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background px-3 backdrop-blur lg:px-6">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-4 lg:px-6">
        <Link
          to="/"
          className="mr-2 inline-flex shrink-0 items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-brass text-xs font-semibold text-brass-foreground">
            B
          </span>
          <span className="max-w-40 truncate whitespace-nowrap text-base sm:max-w-none">
            Blue Prince Journal
          </span>
        </Link>
        <div className="order-2 ml-auto flex shrink-0 items-center gap-1.5 [&>*]:shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const loaded = useStore((s) => s.loaded);
  const notes: Note[] = useLiveQuery(() => db.notes.toArray()) ?? [];
  const todos: Todo[] = useLiveQuery(() => db.todos.toArray()) ?? [];

  const { effectiveInitState, continueWelcome, completeWelcome } = useAppFrameInit({
    noteCount: notes.length,
    todoCount: todos.length,
  });

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
  const isSettingsRoute = pathname === "/settings" || pathname === "/section/settings";

  let appContentClass =
    "min-h-0 flex-1 overflow-x-hidden overflow-y-hidden px-3 max-[899.98px]:overflow-y-auto lg:px-6";
  if (isSettingsRoute) {
    appContentClass =
      "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 max-[899.98px]:overflow-y-auto lg:px-6";
  }

  if (!loaded && effectiveInitState === "checking") {
    return (
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
        <AppHeader />
        <Toaster />
      </div>
    );
  }

  if (effectiveInitState === "welcome") {
    const hasExistingConfiguration =
      notes.length > 0 || todos.length > 0 || Boolean(syncRuntime.getActiveFolderName());

    return (
      <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
        <WelcomeHeaderShell />
        <div className={appContentClass}>
          <WelcomeScreen
            showContinueSuggestion={hasExistingConfiguration}
            onContinue={continueWelcome}
            onDone={completeWelcome}
          />
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground">
      <HeadContent />
      <AppHeader />
      <div className={appContentClass}>
        {children}
      </div>
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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
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
    <div className="flex min-h-[60vh] items-center justify-center px-4">
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

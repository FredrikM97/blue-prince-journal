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
import { lazy, useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/app-header/AppHeader";
import { ThemeToggle } from "@/components/app-header/ThemeToggle";
import { Toaster } from "@/routes/Sonner";
import { toast } from "sonner";
import { AppDataProvider, useAppData, fetchAppSnapshot } from "@/hooks/useAppData";
import { syncRuntime } from "@/data/sync/sync";
import { useAppFrameInit } from "@/hooks/useAppFrameInit";
import {
  getPageLayoutResponsiveClassNames,
  useIsPageLayoutMobile,
} from "@/hooks/usePageLayoutMobile";

type RouterContext = {
  queryClient: QueryClient;
};

function RouteSuspenseFallback() {
  return (
    <div className="flex min-h-96 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

function loadWelcomeScreenRoute() {
  return import("@/components/welcome/WelcomeScreen");
}

function loadNotesPageRoute() {
  return import("@/components/notes/NotesPage");
}

function loadSettingsPageRoute() {
  return import("@/components/settings/SettingsPage");
}

function loadTodosPageRoute() {
  return import("@/components/todos/TodosPage");
}

function loadMapPageRoute() {
  return import("@/components/map/MapPage");
}

function loadImagesPageRoute() {
  return import("@/components/images/ImagesPage");
}

function loadGraphPageRoute() {
  return import("@/components/graph/GraphPage");
}

const WelcomeScreenRoute = lazy(() =>
  loadWelcomeScreenRoute().then((module) => ({
    default: module.WelcomeScreen,
  })),
);

const NotesPageRoute = lazy(() =>
  loadNotesPageRoute().then((module) => ({
    default: module.NotesPage,
  })),
);

const SettingsPageRoute = lazy(() =>
  loadSettingsPageRoute().then((module) => ({
    default: module.SettingsPage,
  })),
);

const TodosPageRoute = lazy(() =>
  loadTodosPageRoute().then((module) => ({
    default: module.TodosPage,
  })),
);

const MapPageRoute = lazy(() =>
  loadMapPageRoute().then((module) => ({
    default: module.MapPage,
  })),
);

const ImagesPageRoute = lazy(() =>
  loadImagesPageRoute().then((module) => ({
    default: module.ImagesPage,
  })),
);

const GraphPageRoute = lazy(() =>
  loadGraphPageRoute().then((module) => ({
    default: module.GraphPage,
  })),
);

export function RootShellView({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function WelcomeHeaderShell() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background px-3 backdrop-blur lg:px-6 flex justify-center">
      <div className="mx-auto flex w-full max-w-[104rem] items-center justify-between gap-2 px-3 py-2 sm:px-4 lg:px-6">
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

function getAppFrameShellClass(isPageLayoutMobile: boolean) {
  const responsiveOverflow = getPageLayoutResponsiveClassNames({
    mobile: "overflow-auto",
    desktop: "overflow-hidden",
  });

  return [
    "flex h-dvh w-full flex-col",
    isPageLayoutMobile ? "overflow-auto" : "overflow-hidden",
    responsiveOverflow,
    "bg-background text-foreground",
  ].join(" ");
}

function AppFrame({ children }: { children: React.ReactNode }) {
  const [routesPreloaded, setRoutesPreloaded] = useState(false);

  // Call all hooks unconditionally FIRST
  const { notes, todos } = useAppData();
  const noteCount = notes.length;
  const todoCount = todos.length;
  const isPageLayoutMobile = useIsPageLayoutMobile();

  const { effectiveInitState, continueWelcome, completeWelcome } = useAppFrameInit({
    noteCount,
    todoCount,
  });

  useEffect(() => {
    async function preloadAllRoutes() {
      await Promise.allSettled([
        loadWelcomeScreenRoute(),
        loadNotesPageRoute(),
        loadSettingsPageRoute(),
        loadTodosPageRoute(),
        loadMapPageRoute(),
        loadImagesPageRoute(),
        loadGraphPageRoute(),
        fetchAppSnapshot(), // fetch first 50 notes/todos in parallel with routes
      ]);
      setRoutesPreloaded(true);
    }

    void preloadAllRoutes();
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

  let appContentClass =
    "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 lg:px-6 flex justify-center";
  const appFrameShellClass = getAppFrameShellClass(isPageLayoutMobile);

  // Show loading screen only while routes are preloading
  // Once routes are ready, show page structure immediately (data populates in background)
  if (!routesPreloaded) {
    return (
      <div className={appFrameShellClass}>
        <WelcomeHeaderShell />
        <div className={appContentClass}>
          <RouteSuspenseFallback />
        </div>
      </div>
    );
  }

  // Routes are preloaded, now decide what to show
  if (effectiveInitState === "welcome") {
    const hasExistingConfiguration =
      noteCount > 0 || todoCount > 0 || Boolean(syncRuntime.getActiveFolderName());

    return (
      <div className={appFrameShellClass}>
        <WelcomeHeaderShell />
        <div className={appContentClass}>
          <WelcomeScreenRoute
            showContinueSuggestion={hasExistingConfiguration}
            onContinue={continueWelcome}
            onDone={completeWelcome}
          />
        </div>
        <Toaster />
      </div>
    );
  }

  // Main app: show page immediately with empty states while data loads
  return (
    <div className={appFrameShellClass}>
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
      <AppDataProvider>
        <AppFrame>
          <Outlet />
        </AppFrame>
      </AppDataProvider>
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
  return (
    <NotesPageRoute title="Notes" emptyHint="No notes yet. Press N anywhere to add one." />
  );
}

export function SectionView({ id }: { id: string }) {
  const { sections } = useAppData();
  const section = useMemo(() => sections.find((s) => s.id === id), [sections, id]);

  if (!section) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center text-muted-foreground">
        Section not found.
      </div>
    );
  }

  if (section.builtin === "todos") {
    return (
      <TodosPageRoute />
    );
  }
  if (section.builtin === "map") {
    return (
      <MapPageRoute />
    );
  }
  if (section.builtin === "graph") {
    return (
      <GraphPageRoute />
    );
  }
  if (section.builtin === "images") {
    return (
      <ImagesPageRoute />
    );
  }
  if (section.id === "settings") {
    return (
      <SettingsPageRoute />
    );
  }

  return (
    <NotesPageRoute filterType={section.filter?.type} title={section.label} />
  );
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
  component: () => (
    <SettingsPageRoute />
  ),
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

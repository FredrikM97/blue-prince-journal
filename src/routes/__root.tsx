import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  HeadContent,
  Link,
  Outlet,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header/AppHeader";
import { ThemeToggle } from "@/components/app-header/ThemeToggle";
import { GraphPage } from "@/components/graph/GraphPage";
import { ImagesPage } from "@/components/images/ImagesPage";
import { MapPage } from "@/components/map/MapPage";
import { NotesPage } from "@/components/notes/NotesPage";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { TodosPage } from "@/components/todos/TodosPage";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";
import { Toaster } from "@/routes/Sonner";
import { toast } from "sonner";
import { AppDataProvider, useAppData } from "@/hooks/useAppData";
import { syncRuntime } from "@/data/sync/sync";
import { useAppFrameInit } from "@/hooks/useAppFrameInit";
import {
  getPageLayoutResponsiveClassNames,
  useIsPageLayoutMobile,
} from "@/hooks/usePageLayoutMobile";

type RouterContext = {
  queryClient: QueryClient;
};

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
  const router = useRouter();
  const navigate = useNavigate();
  const pathname = router.state.location.pathname;
  const isWelcomeRouteActive = pathname === "/";
  const isImagesRouteActive = pathname === "/images";
  const [hasMountedImagesRoute, setHasMountedImagesRoute] = useState(isImagesRouteActive);

  // Call all hooks unconditionally FIRST
  const { notes, todos } = useAppData();
  const noteCount = notes.length;
  const todoCount = todos.length;
  const isPageLayoutMobile = useIsPageLayoutMobile();

  useAppFrameInit({
    noteCount,
    todoCount,
  });

  useEffect(() => {
    if (isImagesRouteActive) {
      setHasMountedImagesRoute(true);
    }
  }, [isImagesRouteActive]);

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

  if (isWelcomeRouteActive) {
    const hasExistingConfiguration =
      noteCount > 0 || todoCount > 0 || Boolean(syncRuntime.getActiveFolderName());

    return (
      <div className={appFrameShellClass}>
        <WelcomeHeaderShell />
        <div className={appContentClass}>
          <WelcomeScreen
            showContinueSuggestion={hasExistingConfiguration}
            onContinue={() => {
              void navigate({ to: "/notes" });
            }}
            onDone={() => {
              void navigate({ to: "/notes" });
            }}
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
        {hasMountedImagesRoute && (
          <div className={isImagesRouteActive ? "contents" : "hidden"} aria-hidden={!isImagesRouteActive}>
            <ImagesPage />
          </div>
        )}
        {!isImagesRouteActive && children}
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
    <NotesPage title="Notes" emptyHint="No notes yet. Press N anywhere to add one." />
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
  component: () => null,
  head: () => ({ meta: [{ title: "Welcome - Blue Prince Journal" }] }),
});

const notesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "notes",
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
    <SettingsPage />
  ),
  head: () => ({ meta: [{ title: "Settings - Blue Prince Journal" }] }),
});

const todosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "todos",
  component: () => <TodosPage />,
  head: () => ({ meta: [{ title: "Todos - Blue Prince Journal" }] }),
});

const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "map",
  component: () => <MapPage />,
  head: () => ({ meta: [{ title: "Map - Blue Prince Journal" }] }),
});

const graphRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "graph",
  component: () => <GraphPage />,
  head: () => ({ meta: [{ title: "Graph - Blue Prince Journal" }] }),
});

const imagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "images",
  component: () => null,
  head: () => ({ meta: [{ title: "Images - Blue Prince Journal" }] }),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  notesRoute,
  settingsRoute,
  todosRoute,
  mapRoute,
  graphRoute,
  imagesRoute,
]);

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

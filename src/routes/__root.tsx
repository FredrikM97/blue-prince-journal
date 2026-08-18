import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  createRoute,
  createRouter,
  HeadContent,
  Link,
  Outlet,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/app-header/AppHeader";
import { GraphPage } from "@/components/graph/GraphPage";
import { ImagesPage } from "@/components/images/ImagesPage";
import { MapPage } from "@/components/map/MapPage";
import { NotesPage } from "@/components/notes/NotesPage";
import { SettingsPage } from "@/components/settings/SettingsPage";
import { TodosPage } from "@/components/todos/TodosPage";
import { WelcomeView } from "@/components/welcome/WelcomeView";
import { Toaster } from "@/routes/Sonner";
import { toast } from "sonner";
import { AppDataProvider } from "@/hooks/useAppData";
import { useAppFrameInit } from "@/hooks/useAppFrameInit";
import {
  getAppFrameShellClass,
  useIsPageLayoutMobile,
} from "@/hooks/usePageLayoutMobile";
import { DartboardPage } from "@/components/dartboard/DartboardPage";

type RouterContext = {
  queryClient: QueryClient;
};

function AppFrame({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isImagesRouteActive = pathname === "/images";
  const [hasMountedImagesRoute, setHasMountedImagesRoute] = useState(isImagesRouteActive);
  const isPageLayoutMobile = useIsPageLayoutMobile();

  useEffect(() => {
    if (isImagesRouteActive) {
      setHasMountedImagesRoute(true);
    }
  }, [isImagesRouteActive]);

  const appContentClass =
    "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 lg:px-6 flex justify-center";
  const appFrameShellClass = getAppFrameShellClass(isPageLayoutMobile);

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
  useAppFrameInit();

  useEffect(() => {
    function onPreloadError(e: Event) {
      e.preventDefault();
      toast("A new version is available", {
        description: "Reload the page to get the latest updates.",
        duration: Infinity,
        action: { label: "Reload", onClick: () => window.location.reload() },
      });
    }
    window.addEventListener("vite:preloadError", onPreloadError);
    return () => window.removeEventListener("vite:preloadError", onPreloadError);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AppDataProvider>
        <Outlet />
      </AppDataProvider>
    </QueryClientProvider>
  );
}

export function AppLayoutView() {
  return (
    <AppFrame>
      <Outlet />
    </AppFrame>
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
  component: () => <RootLayoutView queryClient={rootRoute.useRouteContext().queryClient} />,
  notFoundComponent: NotFoundView,
  errorComponent: ErrorView,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Blue Prince Journal — Blue Prince Notes Taking App & Companion" },
      {
        name: "description",
        content:
          "Blue Prince Journal is a free Blue Prince notes taking app and companion tracker — local-first notes, todos, map, graph and dartboard solver for the Blue Prince puzzle game. Log clues, codes, theories, observations, rooms and stories, track your solved and open todos, and connect discoveries on an interactive graph.",
      },
      {
        name: "keywords",
        content:
          "Blue Prince notes app, Blue Prince notes taking app, Blue Prince companion app, Blue Prince notes, Blue Prince journal, Blue Prince todo tracker, Blue Prince dartboard solver, Blue Prince map",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Blue Prince Journal — Blue Prince Notes Taking App & Companion" },
      {
        property: "og:description",
        content:
          "Free Blue Prince notes taking app and companion tracker — local-first notes, todos, map, graph and dartboard solver for the Blue Prince puzzle game.",
      },
      { property: "og:url", content: "https://blue-prince-journal.pages.dev/" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Blue Prince Journal — Blue Prince Notes Taking App & Companion" },
      {
        name: "twitter:description",
        content:
          "Free Blue Prince notes taking app and companion tracker — local-first notes, todos, map, graph and dartboard solver for the Blue Prince puzzle game.",
      },
    ],
    links: [{ rel: "canonical", href: "https://blue-prince-journal.pages.dev/" }],
  }),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: WelcomeView,
  head: () => ({ meta: [{ title: "Welcome - Blue Prince Journal" }] }),
});

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app",
  component: AppLayoutView,
});

const notesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "notes",
  component: NotesIndexView,
  head: () => ({
    meta: [
      { title: "Notes - Blue Prince Journal" },
      {
        name: "description",
        content:
          "The Blue Prince notes taking app for logging clues, codes, theories, observations and stories, organized by room and tag.",
      },
    ],
  }),
});

const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "settings",
  component: () => <SettingsPage />,
  head: () => ({
    meta: [
      { title: "Settings - Blue Prince Journal" },
      { name: "description", content: "Configure sync, backups and preferences for your Blue Prince Journal." },
    ],
  }),
});

const todosRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "todos",
  component: () => <TodosPage />,
  head: () => ({
    meta: [
      { title: "Todos - Blue Prince Journal" },
      {
        name: "description",
        content: "Track open, in-progress and completed Blue Prince todos, tasks and objectives by room.",
      },
    ],
  }),
});

const mapRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "map",
  component: () => <MapPage />,
  head: () => ({
    meta: [
      { title: "Map - Blue Prince Journal" },
      {
        name: "description",
        content: "Interactive Blue Prince mansion map with rooms, notes and progress tracking.",
      },
    ],
  }),
});

const graphRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "graph",
  component: () => <GraphPage />,
  head: () => ({
    meta: [
      { title: "Graph - Blue Prince Journal" },
      {
        name: "description",
        content: "Visualize connections between Blue Prince clues, codes, theories, rooms and tags in an interactive graph.",
      },
    ],
  }),
});

const imagesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "images",
  component: () => <ImagesPage />,
  head: () => ({
    meta: [
      { title: "Images - Blue Prince Journal" },
      {
        name: "description",
        content: "Browse and manage screenshots and reference images attached to your Blue Prince notes.",
      },
    ],
  }),
});

const dartboardRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "dartboard",
  component: () => <DartboardPage />,
  head: () => ({
    meta: [
      { title: "Dartboard - Blue Prince Journal" },
      {
        name: "description",
        content: "Solve the Blue Prince dartboard puzzle with an interactive operator and modifier calculator.",
      },
    ],
  }),
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  appLayoutRoute.addChildren([
    notesRoute,
    settingsRoute,
    todosRoute,
    mapRoute,
    graphRoute,
    imagesRoute,
    dartboardRoute,
  ]),
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

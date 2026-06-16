import { Link, useNavigate } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/app-header/ThemeToggle";
import { WelcomeScreen } from "@/components/welcome/WelcomeScreen";
import { Toaster } from "@/routes/Sonner";
import { useAppData } from "@/hooks/useAppData";
import { useStore } from "@/hooks/useStore";
import {
  getAppFrameShellClass,
  useIsPageLayoutMobile,
} from "@/hooks/usePageLayoutMobile";

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

export function WelcomeView() {
  const navigate = useNavigate();
  const isPageLayoutMobile = useIsPageLayoutMobile();
  const { notes, todos } = useAppData();
  const syncFolderName = useStore((s) => s.syncFolderName);
  const hasExistingData = notes.length > 0 || todos.length > 0 || Boolean(syncFolderName);
  const appFrameShellClass = getAppFrameShellClass(isPageLayoutMobile);
  const appContentClass =
    "min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 lg:px-6 flex justify-center";
  return (
    <div className={appFrameShellClass}>
      <WelcomeHeaderShell />
      <div className={appContentClass}>
        <WelcomeScreen
          showContinueSuggestion={hasExistingData}
          onContinue={() => void navigate({ to: "/notes" })}
          onDone={() => void navigate({ to: "/notes" })}
        />
      </div>
      <Toaster />
    </div>
  );
}

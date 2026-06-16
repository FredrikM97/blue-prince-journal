import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Plus, FolderSync } from "lucide-react";
import { useEffect, useRef } from "react";
import { useStore } from "@/hooks/useStore";
import { Button } from "@/components/common/Button";
import { ThemeToggle } from "@/components/app-header/ThemeToggle";
import { Stack } from "@/components/common/general/Stack";
import { KeyboardKey } from "@/components/common/KeyboardKey";
import { Text } from "@/components/common/Typography";
import { HeaderNav } from "./HeaderNav";
import { HeaderSearch } from "./HeaderSearch";
import { HeaderMenu } from "./HeaderMenu";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return /input|textarea|select/i.test(target.tagName) || target.isContentEditable;
}

function isShortcutAllowed(event: KeyboardEvent, allowCtrlOrMeta = false): boolean {
  if (isTypingTarget(event.target)) return false;
  if (event.altKey) return false;
  if (!allowCtrlOrMeta && (event.ctrlKey || event.metaKey)) return false;
  return true;
}

export function AppHeader() {
  const openCapture = useStore((s) => s.openCapture);
  const captureOpen = useStore((s) => s.captureOpen);
  const closeCapture = useStore((s) => s.closeCapture);
  const syncFolderName = useStore((s) => s.syncFolderName);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const canCreateInPlace = pathname === "/notes";

  useEffect(() => {
    if (captureOpen && !canCreateInPlace) {
      closeCapture();
    }
  }, [captureOpen, canCreateInPlace, closeCapture]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const isSlash = !e.ctrlKey && e.key === "/";
      if (isCtrlK || isSlash) {
        if (!isShortcutAllowed(e, true)) return;
        e.preventDefault();
        const input = searchInputRef.current;
        if (!input) return;
        input.focus();
        input.select();
        return;
      }

      if (!isShortcutAllowed(e)) return;
      if (e.key !== "n" && e.key !== "N" && e.key !== "+") return;
      e.preventDefault();
      if (!canCreateInPlace) {
        void navigate({ to: "/notes" });
      }
      openCapture({
        kind: "note",
        noteType: undefined,
        returnTo: canCreateInPlace ? undefined : pathname,
      });
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCapture, canCreateInPlace, navigate, pathname]);

  return (
    <Stack
      as="header"
      className="sticky top-0 z-40 border-b border-border bg-background px-3 backdrop-blur lg:px-6 flex justify-center"
      gap="0"
    >
      <Stack
        className="mx-auto flex w-full max-w-[104rem] flex-wrap items-center gap-2 px-3 py-2 sm:px-4 lg:flex-nowrap lg:px-6"
        gap="0"
      >
        <Link
          to="/"
          className="mr-2 inline-flex shrink-0 items-center gap-2 rounded-md px-1.5 py-1 hover:bg-accent"
        >
          <Text
            as="span"
            className="inline-flex h-7 w-7 items-center justify-center rounded bg-brass text-xs font-semibold text-brass-foreground"
            size="xs"
            tone="default"
          >
            B
          </Text>
          <Text
            as="span"
            className="hidden max-w-40 truncate whitespace-nowrap text-base sm:inline sm:max-w-none"
            size="base"
            tone="default"
          >
            Blue Prince Journal
          </Text>
        </Link>

        <HeaderNav pathname={pathname} />

        <Stack
          className="app-header-controls order-2 ml-auto flex shrink-0 items-center gap-1.5 lg:order-none [&>*]:shrink-0"
          gap="0"
        >
          <ThemeToggle />
          {syncFolderName && (
            <Link
              to="/settings"
              title={`Syncing to "${syncFolderName}"`}
              className="flex items-center gap-1.5 text-xs text-green-500"
            >
              <FolderSync className="h-3.5 w-3.5" />
              <Text
                as="span"
                className="hidden max-w-[10rem] truncate xl:block"
                size="xs"
                tone="default"
                truncate
              >
                {syncFolderName}
              </Text>
            </Link>
          )}
          <HeaderSearch inputRef={searchInputRef} />
          <Button
            size="sm"
            onClick={() => {
              if (!canCreateInPlace) {
                void navigate({ to: "/notes" });
              }
              openCapture({
                kind: "note",
                noteType: undefined,
                returnTo: canCreateInPlace ? undefined : pathname,
              });
            }}
            className="bg-brass px-2 text-brass-foreground hover:bg-brass max-sm:h-8 max-sm:w-8 max-sm:justify-center max-sm:p-0"
          >
            <Plus className="h-4 w-4" />
            <span className="max-sm:hidden">Add note</span>
            <KeyboardKey
              variant="shortcut"
              className="rounded border border-border bg-background px-1 py-0 text-[10px] font-semibold leading-4 text-foreground opacity-100 max-sm:hidden"
            >
              N
            </KeyboardKey>
          </Button>
          <HeaderMenu />
        </Stack>
      </Stack>
    </Stack>
  );
}

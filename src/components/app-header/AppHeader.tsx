import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Search,
  Plus,
  Settings as SettingsIcon,
  Download,
  Upload,
  FolderSync,
  Coffee,
  MessageSquareText,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { exportAll, importAll } from "@/data/storage/backup";
import { useSections } from "./useSections";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/input/InputField";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { ThemeToggle } from "@/components/app-header/ThemeToggle";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/common/menu/DropdownMenu";
import { SuggestionsDropdown } from "@/components/common/suggestions/SuggestionsDropdown";
import { Stack } from "@/components/common/general/Stack";
import { KeyboardKey } from "@/components/common/KeyboardKey";
import { Text } from "@/components/common/Typography";

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

export function AppHeader({ welcomeMode = false }: { welcomeMode?: boolean }) {
  const buyMeACoffeeUrl = "https://buymeacoffee.com/fredrikm97";
  const sections = useSections();
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const [searchInput, setSearchInput] = useState(search);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const deferredSearchInput = useDeferredValue(searchInput);
  const openCapture = useStore((s) => s.openCapture);
  const captureOpen = useStore((s) => s.captureOpen);
  const closeCapture = useStore((s) => s.closeCapture);
  const syncFolderName = useStore((s) => s.syncFolderName);
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeSection = useMemo(() => {
    const match = pathname.match(/^\/section\/([^/]+)$/);
    if (!match) return null;
    const sectionId = decodeURIComponent(match[1]);
    return sections.find((s) => s.id === sectionId) ?? null;
  }, [pathname, sections]);

  const canCreateInPlace =
    pathname === "/" ||
    (pathname.startsWith("/section/") && (!activeSection || !activeSection.builtin));

  const defaultCaptureNoteType = activeSection?.filter?.type;
  const showMainControls = !welcomeMode;
  const hasSearchText = searchInput.trim().length > 0;

  useEffect(() => {
    if (deferredSearchInput !== search) {
      setSearch(deferredSearchInput);
    }
  }, [deferredSearchInput, search, setSearch]);

  useEffect(() => {
    if (captureOpen && !canCreateInPlace) {
      closeCapture();
    }
  }, [captureOpen, canCreateInPlace, closeCapture]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Ctrl+K or bare "/" focuses the search bar
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
        void navigate({ to: "/" });
      }
      openCapture({
        kind: "note",
        noteType: defaultCaptureNoteType,
        returnTo: canCreateInPlace ? undefined : pathname,
      });
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openCapture, canCreateInPlace, defaultCaptureNoteType, navigate, pathname]);

  function hrefFor(s: { id: string; builtin?: string; filter?: { type?: string } }) {
    if (s.builtin === "notes") return "/";
    return `/section/${s.id}`;
  }

  function openWelcomeScreen() {
    window.dispatchEvent(new CustomEvent("bp:show-welcome"));
  }

  return (
    <>
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />

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
            onClick={openWelcomeScreen}
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

          {showMainControls && (
            <>
              <Stack
                as="nav"
                className="order-3 flex basis-full min-w-0 flex-nowrap items-center gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:order-none lg:basis-auto lg:flex-1 lg:flex-wrap lg:overflow-visible lg:pb-0"
                gap="0"
              >
                {sections
                  .filter((s) => !s.hidden && Boolean(s.builtin))
                  .map((s) => {
                    const href = hrefFor(s);
                    const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                    let linkClass =
                      "rounded px-2 py-1 text-sm text-muted-foreground dark:text-foreground/70 hover:bg-accent hover:text-foreground";
                    if (isActive) {
                      linkClass = `${linkClass} bg-secondary text-foreground`;
                    }
                    return (
                      <Link key={s.id} to={href} className={linkClass}>
                        {s.label}
                      </Link>
                    );
                  })}
              </Stack>

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
                <Stack
                  className="relative w-28 sm:w-36 lg:w-auto"
                  gap="0"
                >
                  <Search
                    className={`pointer-events-none absolute left-2.5 top-1/2 z-10 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground ${hasSearchText ? "hidden" : ""}`}
                  />
                  <SuggestionsDropdown
                    dropdownClassName="left-0 right-auto top-[calc(100%+0.25rem)] min-w-56 max-w-80"
                    showSuggestionHint={false}
                    displayMode="plain"
                    includeTypeSuggestions={false}
                    includeDateSuggestions={false}
                    dropdownAlign="left"
                    preservePrefixesInPlainMode={["@", "#", "^"]}
                  >
                    <InputField
                      label="Search"
                      hideLabel
                      inputRef={searchInputRef}
                      value={searchInput}
                      onChange={setSearchInput}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setSearchInput("");
                          searchInputRef.current?.blur();
                        }
                      }}
                      placeholder=" "
                      size="sm"
                      inputClassName={`w-full lg:w-44 ${hasSearchText ? "pl-3" : "pl-8"}`}
                    />
                  </SuggestionsDropdown>
                </Stack>
                <Button
                  size="sm"
                  onClick={() => {
                    if (!canCreateInPlace) {
                      void navigate({ to: "/" });
                    }
                    openCapture({
                      kind: "note",
                      noteType: defaultCaptureNoteType,
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label="Settings"
                    >
                      <SettingsIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() => exportAll().then(() => toast.success("Exported"))}
                    >
                      <Download className="mr-1 h-4 w-4" /> Export all (ZIP)
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
                      <Upload className="mr-1 h-4 w-4" /> Import…
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setFeedbackOpen(true)}>
                      <MessageSquareText className="mr-1 h-4 w-4" /> Send feedback
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={buyMeACoffeeUrl} target="_blank" rel="noreferrer">
                        <Coffee className="mr-1 h-4 w-4" /> Buy me a coffee
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <SettingsIcon className="mr-1 h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".zip,application/zip,application/json,.json"
                  hidden
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      await importAll(f, "merge");
                      toast.success("Imported");
                    } catch (err) {
                      toast.error((err as Error).message);
                    }
                    e.target.value = "";
                  }}
                />
              </Stack>
            </>
          )}
        </Stack>
      </Stack>
    </>
  );
}

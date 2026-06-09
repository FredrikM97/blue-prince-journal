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
import { submitFeedback } from "@/data/feedback";
import { useSections } from "@/hooks/useSections";
import { Button } from "@/components/common/Button";
import { InputField } from "@/components/common/input/InputField";
import { FeedbackDialog } from "@/components/app-header/FeedbackDialog";
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

export function AppHeader() {
  const buyMeACoffeeUrl = "https://buymeacoffee.com/fredrikm97";
  const sections = useSections();
  const search = useStore((s) => s.search);
  const setSearch = useStore((s) => s.setSearch);
  const [searchInput, setSearchInput] = useState(search);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackContact, setFeedbackContact] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
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
      const tgt = e.target as HTMLElement;
      const typing = (tgt && /input|textarea|select/i.test(tgt.tagName)) || tgt?.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;
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

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tgt = e.target as HTMLElement;
      const typing = (tgt && /input|textarea|select/i.test(tgt.tagName)) || tgt?.isContentEditable;
      if (typing || e.metaKey || e.altKey) return;

      // Ctrl+K or bare "/" focuses the search bar
      const isCtrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      const isSlash = !e.ctrlKey && e.key === "/";
      if (!isCtrlK && !isSlash) return;

      e.preventDefault();
      const input = searchInputRef.current;
      if (!input) return;
      input.focus();
      input.select();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function hrefFor(s: { id: string; builtin?: string; filter?: { type?: string } }) {
    if (s.builtin === "notes") return "/";
    return `/section/${s.id}`;
  }

  function openWelcomeScreen() {
    window.dispatchEvent(new CustomEvent("bp:show-welcome"));
  }

  async function sendFeedback() {
    const message = feedbackMessage.trim();
    if (!message) return;

    setFeedbackSubmitting(true);
    try {
      await submitFeedback({
        message,
        contact: feedbackContact.trim(),
        appVersion: __APP_COMMIT_HASH__,
      });
      toast.success("Feedback sent");
      setFeedbackMessage("");
      setFeedbackContact("");
      setFeedbackOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send feedback");
    } finally {
      setFeedbackSubmitting(false);
    }
  }

  return (
    <>
      <FeedbackDialog
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        message={feedbackMessage}
        onMessageChange={setFeedbackMessage}
        contact={feedbackContact}
        onContactChange={setFeedbackContact}
        submitting={feedbackSubmitting}
        buildHash={__APP_COMMIT_HASH__}
        onSubmit={() => {
          void sendFeedback();
        }}
      />

      <Stack as="header" className="app-header" gap="0">
        <Stack className="app-header-inner" gap="0">
          <Link to="/" className="app-brand-link" onClick={openWelcomeScreen}>
            <Text as="span" className="app-brand-badge" size="xs" tone="default">
              B
            </Text>
            <Text as="span" className="app-brand-title" size="base" tone="default">
              Blue Prince Journal
            </Text>
          </Link>

          <Stack as="nav" className="app-nav" gap="0">
            {sections
              .filter((s) => !s.hidden && (Boolean(s.builtin) || s.id === "books"))
              .map((s) => {
                const href = hrefFor(s);
                const isActive = pathname === href || (href !== "/" && pathname.startsWith(href));
                let linkClass = "app-nav-link";
                if (isActive) {
                  linkClass = "app-nav-link app-nav-link-active";
                }
                return (
                  <Link key={s.id} to={href} className={linkClass}>
                    {s.label}
                  </Link>
                );
              })}
          </Stack>

          <Stack className="app-header-controls" gap="0">
            {syncFolderName && (
              <Link
                to="/settings"
                title={`Syncing to "${syncFolderName}"`}
                className="header-sync-status"
              >
                <FolderSync className="h-3.5 w-3.5" />
                <Text as="span" className="sync-folder-name" size="xs" tone="default" truncate>
                  {syncFolderName}
                </Text>
              </Link>
            )}
            <ThemeToggle />
            <Stack className="app-search-wrap" gap="0">
              <Search className="app-search-icon" />
              <SuggestionsDropdown
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
              className="app-add-button"
            >
              <Plus className="app-add-icon" />
              <span>Add note</span>
              <KeyboardKey variant="shortcut" className="app-add-shortcut">
                N
              </KeyboardKey>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="app-icon-button"
                  aria-label="Settings"
                >
                  <SettingsIcon className="app-icon-sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={() => exportAll().then(() => toast.success("Exported"))}
                >
                  <Download className="app-menu-icon" /> Export all (ZIP)
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => fileRef.current?.click()}>
                  <Upload className="app-menu-icon" /> Import…
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setFeedbackOpen(true)}>
                  <MessageSquareText className="app-menu-icon" /> Send feedback
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={buyMeACoffeeUrl} target="_blank" rel="noreferrer">
                    <Coffee className="app-menu-icon" /> Buy me a coffee
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <SettingsIcon className="app-menu-icon" /> Settings
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
        </Stack>
      </Stack>
    </>
  );
}

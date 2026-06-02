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
  Send,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/data/store";
import { exportAll, importAll } from "@/data/io";
import { submitFeedback } from "@/data/feedback";
import { Button, IconButton } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import { InputField } from "@/components/common/input/InputField";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/common/dropdown/DropdownMenu";

export function AppHeader() {
  const buyMeACoffeeUrl = "https://buymeacoffee.com/fredrikm97";
  const sections = useStore((s) => s.sections);
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
  const load = useStore((s) => s.load);
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
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send feedback</DialogTitle>
            <DialogDescription>
              Share a bug report, feature idea, or anything that would make the journal better.
            </DialogDescription>
            <p className="text-xs text-muted-foreground">
              Build:{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-[0.8em]">
                {__APP_COMMIT_HASH__}
              </code>{" "}
            </p>
          </DialogHeader>

          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendFeedback();
            }}
          >
            <label className="flex flex-col gap-1.5 text-sm font-medium" htmlFor="feedback-message">
              Message
              <textarea
                id="feedback-message"
                autoFocus
                value={feedbackMessage}
                onChange={(event) => setFeedbackMessage(event.target.value)}
                placeholder="Tell me what happened or what you’d like to see…"
                className="textarea-base min-h-32 resize-y"
              />
            </label>

            <InputField
              label="Contact"
              value={feedbackContact}
              onChange={setFeedbackContact}
              placeholder="Email or handle, optional"
            />

            <div className="dialog-footer pt-1">
              <Button type="button" variant="outline" onClick={() => setFeedbackOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={feedbackSubmitting || feedbackMessage.trim().length === 0}
              >
                <Send className="app-menu-icon" />
                {feedbackSubmitting ? "Sending…" : "Send"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-brand-link" onClick={openWelcomeScreen}>
            <span className="app-brand-badge">B</span>
            <span className="app-brand-title">Blue Prince Journal</span>
          </Link>

          <nav className="app-nav">
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
          </nav>

          <div className="app-header-controls">
            {syncFolderName && (
              <Link
                to="/settings"
                title={`Syncing to "${syncFolderName}"`}
                className="header-sync-status"
              >
                <FolderSync className="h-3.5 w-3.5" />
                <span className="max-w-[10rem] truncate">{syncFolderName}</span>
              </Link>
            )}
            <ThemeToggle />
            <div className="app-search-wrap">
              <Search className="app-search-icon" />
              <input
                ref={searchInputRef}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchInput("");
                    searchInputRef.current?.blur();
                  }
                }}
                placeholder=""
                aria-label="Search notes"
                className="input-base app-search-input"
              />
            </div>
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
              <kbd className="app-add-shortcut">N</kbd>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <IconButton className="app-icon-button" aria-label="Settings">
                  <SettingsIcon className="app-icon-sm" />
                </IconButton>
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
              className="app-hidden-file-input"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                try {
                  await importAll(f, "merge");
                  await load();
                  toast.success("Imported");
                } catch (err) {
                  toast.error((err as Error).message);
                }
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </header>
    </>
  );
}

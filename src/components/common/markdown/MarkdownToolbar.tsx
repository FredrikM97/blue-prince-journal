import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, HelpCircle, Maximize2, MoreHorizontal, WandSparkles } from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/menu/DropdownMenu";
import { MetaText } from "@/components/common/Typography";
import { getViewportWidth } from "@/hooks/useMediaQuery";

export type MarkdownToolbarAction = {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
};

const SHORTCUTS: { tokens: string[]; desc: string }[] = [
  { tokens: ["#tag"], desc: "add a tag" },
  { tokens: ["@room"], desc: "set room" },
  { tokens: ["^note-title"], desc: "link to note" },
  { tokens: [">2025-05-28"], desc: "set date" },
];

function MarkdownShortcutHelp() {
  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; right: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function handleToggle() {
    if (!open && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + 6,
        right: getViewportWidth() - rect.right,
      });
    }
    setOpen((value) => !value);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle shortcut help"
        title="Shortcuts"
        className="h-7 w-7 border-border bg-card text-foreground hover:bg-card"
        onClick={handleToggle}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </Button>

      {open &&
        popupPos &&
        createPortal(
          <div
            ref={popupRef}
            className="fixed z-[9999] w-80 rounded-md border border-border bg-card p-3 text-[11px] shadow-lg"
            style={{
              "--md-shortcut-top": `${popupPos.top}px`,
              "--md-shortcut-right": `${popupPos.right}px`,
              top: "var(--md-shortcut-top)",
              right: "var(--md-shortcut-right)",
            } as CSSProperties}
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Token shortcuts
            </p>
            <div className="grid grid-cols-[max-content_1fr] items-center gap-x-2 gap-y-1.5">
              {SHORTCUTS.map(({ tokens, desc }) => (
                <Fragment key={desc}>
                  <div className="flex flex-wrap gap-1">
                    {tokens.map((token) => (
                      <kbd
                        key={token}
                        className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-foreground"
                      >
                        {token}
                      </kbd>
                    ))}
                  </div>
                  <span className="whitespace-nowrap">
                    <MetaText as="span" size="sm" leading="tight">
                      {desc}
                    </MetaText>
                  </span>
                </Fragment>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function MarkdownToolbar({
  primaryActions,
  overflowActions,
  onFormatTables,
  preview,
  onTogglePreview,
  allowExpand,
  onExpand,
}: {
  primaryActions: MarkdownToolbarAction[];
  overflowActions: MarkdownToolbarAction[];
  onFormatTables: () => void;
  preview: boolean;
  onTogglePreview: () => void;
  allowExpand: boolean;
  onExpand: () => void;
}) {
  const toolbarContainerRef = useRef<HTMLDivElement | null>(null);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  useEffect(() => {
    const container = toolbarContainerRef.current;
    if (!container) return;

    const COMPACT_BREAKPOINT = 520;

    const refreshLayout = () => {
      const compact = container.clientWidth < COMPACT_BREAKPOINT;
      setShowOverflowMenu(compact && overflowActions.length > 0);
    };

    refreshLayout();

    const observer = new ResizeObserver(() => {
      refreshLayout();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [overflowActions.length]);

  let previewToggleLabel = "Show preview";
  let expandLabel = "Expand editor";
  if (preview) {
    previewToggleLabel = "Hide preview";
    expandLabel = "Expand preview";
  }

  const showInlineOverflow = overflowActions.length > 0 && !showOverflowMenu;

  return (
    <div ref={toolbarContainerRef}>
      <div
        className="flex flex-nowrap items-center gap-0.5 overflow-x-auto rounded-t-md border border-b-0 border-input bg-muted px-1.5 py-1"
        role="toolbar"
        aria-label="Formatting tools"
      >
        {primaryActions.map((action) => (
          <Button
            variant="ghost"
            size="icon-h2"
            key={action.key}
            aria-label={action.label}
            title={action.label}
            onClick={action.onSelect}
          >
            {action.icon}
          </Button>
        ))}

        {showInlineOverflow &&
          overflowActions.map((action) => (
            <Button
              variant="ghost"
              size="icon-h2"
              key={action.key}
              aria-label={action.label}
              title={action.label}
              onClick={action.onSelect}
            >
              {action.icon}
            </Button>
          ))}

        {!showOverflowMenu && (
          <Button
            variant="ghost"
            size="icon-h2"
            aria-label="Format tables"
            title="Format tables"
            onClick={onFormatTables}
          >
            <WandSparkles className="h-3.5 w-3.5" />
          </Button>
        )}

        {showOverflowMenu && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-h2"
                aria-label="More formatting tools"
                title="More formatting tools"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={6}>
              {overflowActions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  onSelect={(event) => {
                    event.preventDefault();
                    action.onSelect();
                  }}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  onFormatTables();
                }}
              >
                <WandSparkles className="h-3.5 w-3.5" />
                Format tables
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <span className="mx-1 h-4 w-px bg-border" />
        <MarkdownShortcutHelp />
        <span className="mx-1 h-4 w-px bg-border" />

        <Button
          variant="ghost"
          size="icon-h2"
          aria-label={previewToggleLabel}
          title={previewToggleLabel}
          onClick={onTogglePreview}
        >
          {preview && <EyeOff className="h-3.5 w-3.5" />}
          {!preview && <Eye className="h-3.5 w-3.5" />}
        </Button>

        {allowExpand && (
          <>
            <span className="mx-1 h-4 w-px bg-border" />
            <Button
              variant="ghost"
              size="icon-h2"
              aria-label={expandLabel}
              title={expandLabel}
              onClick={onExpand}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

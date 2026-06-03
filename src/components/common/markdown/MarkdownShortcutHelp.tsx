/**
 * MarkdownShortcutHelp — self-contained ? button that opens a floating token shortcut reference.
 *
 * Renders the popup via a React portal so it is never clipped by ancestor overflow or
 * stacking-context constraints. Positions itself above the trigger button using fixed coords.
 */
import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { MetaText } from "@/components/common/Typography";

const SHORTCUTS: { tokens: string[]; desc: string }[] = [
  { tokens: ["#tag"], desc: "add a tag" },
  { tokens: ["@room"], desc: "set room" },
  { tokens: ["^note-title"], desc: "link to note" },
  { tokens: [">2025-05-28"], desc: "set date" },
];

export function MarkdownShortcutHelp() {
  const [open, setOpen] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; right: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (wrapperRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
        right: window.innerWidth - rect.right,
      });
    }
    setOpen((v) => !v);
  }

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle shortcut help"
        title="Shortcuts"
        className="h-7 w-7"
        onClick={handleToggle}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </Button>

      {open &&
        popupPos &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: popupPos.top,
              right: popupPos.right,
              zIndex: 9999,
              width: "20rem",
              borderRadius: "0.375rem",
              border: "1px solid hsl(var(--border))",
              background: "hsl(var(--popover))",
              padding: "0.75rem",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
              fontSize: "11px",
            }}
          >
            <p
              style={{
                marginBottom: "0.5rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: "10px",
                fontWeight: 600,
                color: "hsl(var(--muted-foreground))",
              }}
            >
              Token shortcuts
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                alignItems: "center",
                columnGap: "0.5rem",
                rowGap: "0.375rem",
              }}
            >
              {SHORTCUTS.map(({ tokens, desc }) => (
                <Fragment key={desc}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
                    {tokens.map((t) => (
                      <kbd
                        key={t}
                        style={{
                          borderRadius: "0.25rem",
                          background: "hsl(var(--accent))",
                          padding: "0.125rem 0.25rem",
                          fontFamily: "var(--font-mono)",
                          color: "hsl(var(--foreground))",
                        }}
                      >
                        {t}
                      </kbd>
                    ))}
                  </div>
                  <span style={{ paddingTop: "0.125rem", whiteSpace: "nowrap" }}>
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

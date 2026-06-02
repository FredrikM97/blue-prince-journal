/**
 * MarkdownShortcutHelp — self-contained ? button that opens a floating token shortcut reference.
 *
 * Renders the popup via a React portal so it is never clipped by ancestor overflow or
 * stacking-context constraints. Positions itself above the trigger button using fixed coords.
 */
import { Fragment, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { HelpCircle } from "lucide-react";
import { IconButton } from "@/components/common/Button";
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
    <div ref={wrapperRef} className="relative">
      <IconButton
        aria-label="Toggle shortcut help"
        title="Shortcuts"
        className="h-7 w-7"
        onClick={handleToggle}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </IconButton>

      {open &&
        popupPos &&
        createPortal(
          <div
            ref={popupRef}
            style={{ position: "fixed", top: popupPos.top, right: popupPos.right, zIndex: 9999 }}
            className="md-shortcut-popover"
          >
            <p className="md-shortcut-title">Token shortcuts</p>
            <div className="md-shortcut-grid">
              {SHORTCUTS.map(({ tokens, desc }) => (
                <Fragment key={desc}>
                  <div className="flex flex-wrap gap-1">
                    {tokens.map((t) => (
                      <code key={t} className="md-shortcut-key">
                        {t}
                      </code>
                    ))}
                  </div>
                  <span className="pt-0.5">
                    <MetaText as="span" size="sm" leading="tight">
                      <span className="md-shortcut-desc">{desc}</span>
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

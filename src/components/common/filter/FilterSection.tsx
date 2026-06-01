import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function FilterSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  onReset,
  badge,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  onReset?: () => void;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);

  let collapseIcon = <ChevronRight className="h-3 w-3" />;
  if (open) {
    collapseIcon = <ChevronDown className="h-3 w-3" />;
  }

  return (
    <div className="filter-section">
      {collapsible && (
        <button type="button" className="filter-section-toggle" onClick={() => setOpen((v) => !v)}>
          <span>
            {title}
            {!open && badge && <span className="filter-section-badge">{badge}</span>}
          </span>
          {collapseIcon}
        </button>
      )}

      {!collapsible && (
        <div className="filter-section-header">
          <span>{title}</span>
          {onReset && (
            <button type="button" className="filter-clear-btn" onClick={onReset}>
              All
            </button>
          )}
        </div>
      )}

      {(!collapsible || open) && <div className="filter-section-body">{children}</div>}
    </div>
  );
}

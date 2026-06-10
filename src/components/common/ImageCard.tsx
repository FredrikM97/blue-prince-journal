import type { ReactNode } from "react";
import { X } from "lucide-react";
import { StoredImageView } from "@/components/common/StoredImageView";

/**
 * Square image card with an overlay label.
 *
 * - Default (`size="auto"`): fills its grid cell via `aspect-square w-full`.
 * - Small (`size="sm"`): fixed 64 × 64 px for horizontal strips.
 *
 * Pass `onClick` to make the card a clickable button.
 * Pass `onRemove` to show a remove button on hover (top-right corner).
 * Pass `selected` to apply the selection border style.
 * Pass `badge` to render extra content (e.g. a chip) in the label row.
 */
export function ImageCard({
  id,
  label,
  size = "auto",
  selected = false,
  badge,
  onClick,
  onRemove,
}: {
  id: string;
  label: string;
  size?: "auto" | "sm";
  selected?: boolean;
  badge?: ReactNode;
  onClick?: () => void;
  onRemove?: (e: React.MouseEvent) => void;
}) {
  let cardClass =
    "group relative overflow-hidden rounded-md border border-border bg-muted cursor-pointer transition-colors hover:border-brass";
  if (size === "sm") {
    cardClass = `${cardClass} h-16 w-16 shrink-0`;
  } else {
    cardClass = `${cardClass} aspect-square w-full`;
  }
  if (selected) {
    cardClass = `${cardClass} border-brass bg-brass ring-1 ring-brass text-brass-foreground`;
  }

  const inner = (
    <>
      <StoredImageView id={id} className="absolute inset-0 h-full w-full object-cover" alt={label} mode="thumb" />
      <span
        className="absolute bottom-0 left-0 right-0 flex items-center gap-1 bg-background px-1.5 py-0.5"
        title={label}
      >
        <span className="min-w-0 flex-1 truncate text-[10px] leading-tight text-foreground">{label}</span>
        {badge}
      </span>
      {onRemove && (
        <button
          type="button"
          className="absolute right-1 top-1 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full border border-border bg-background text-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100"
          aria-label="Remove image"
          onClick={onRemove}
        >
          <X className="h-2.5 w-2.5" />
        </button>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={cardClass} onClick={onClick} aria-label={label}>
        {inner}
      </button>
    );
  }

  return <div className={cardClass}>{inner}</div>;
}

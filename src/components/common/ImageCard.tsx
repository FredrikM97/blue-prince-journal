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
  let cardClass = size === "sm" ? "image-card image-card-sm" : "image-card";
  if (selected) cardClass = `${cardClass} image-card-selected`;

  const inner = (
    <>
      <StoredImageView id={id} className="image-card-thumb" alt={label} mode="thumb" />
      <span className="image-card-label" title={label}>
        <span className="image-card-label-text">{label}</span>
        {badge}
      </span>
      {onRemove && (
        <button
          type="button"
          className="image-card-remove"
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

import { createElement } from "react";

type ChipVariant =
  | "default"
  | "solid"
  | "room"
  | "tag"
  | "priority-high"
  | "priority-normal"
  | "priority-low";

const CHIP_CLASS: Record<ChipVariant, string> = {
  default:
    "inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground",
  solid: "inline-flex items-center rounded border border-border px-1.5 py-0.5 text-[10px] text-foreground",
  room: "inline-flex items-center rounded border border-brass px-1.5 py-0.5 text-[10px] text-brass",
  tag: "inline-flex items-center rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-foreground",
  "priority-high":
    "inline-flex items-center rounded border border-destructive bg-destructive px-1.5 py-0.5 text-[10px] text-destructive-foreground",
  "priority-normal":
    "inline-flex items-center rounded border border-brass bg-brass px-1.5 py-0.5 text-[10px] text-brass-foreground",
  "priority-low":
    "inline-flex items-center rounded border border-transparent bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground",
};

/** Small inline label chip. Variants map to named CSS classes in layout.css. */
export function Chip({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  /** "default" = muted; "solid" = full border foreground; "room" = brass tint. */
  variant?: ChipVariant;
}) {
  return createElement("span", { className: CHIP_CLASS[variant] }, children);
}

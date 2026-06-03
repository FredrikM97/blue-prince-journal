import { createElement } from "react";

/** Small inline label chip. Variants map to named CSS classes in layout.css. */
export function Chip({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  /** "default" = muted; "solid" = full border foreground; "room" = brass tint. */
  variant?:
    | "default"
    | "solid"
    | "room"
    | "tag"
    | "priority-high"
    | "priority-normal"
    | "priority-low";
}) {
  let cls = "chip";
  if (variant === "solid") cls = "chip-solid";
  if (variant === "room") cls = "chip-room";
  if (variant === "tag") cls = "chip-tag";
  if (variant === "priority-high") cls = "chip-priority-high";
  if (variant === "priority-normal") cls = "chip-priority-normal";
  if (variant === "priority-low") cls = "chip-priority-low";
  return createElement("span", { className: cls }, children);
}

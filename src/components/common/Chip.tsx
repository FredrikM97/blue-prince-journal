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
  default: "chip",
  solid: "chip-solid",
  room: "chip-room",
  tag: "chip-tag",
  "priority-high": "chip-priority-high",
  "priority-normal": "chip-priority-normal",
  "priority-low": "chip-priority-low",
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

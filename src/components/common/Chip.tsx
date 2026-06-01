/** Small inline label chip. Variants map to named CSS classes in layout.css. */
export function Chip({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  /** "default" = muted; "solid" = full border foreground; "room" = brass tint. */
  variant?: "default" | "solid" | "room" | "tag";
}) {
  let cls = "chip";
  if (variant === "solid") cls = "chip-solid";
  if (variant === "room") cls = "chip-room";
  if (variant === "tag") cls = "chip-tag";
  return <span className={cls}>{children}</span>;
}

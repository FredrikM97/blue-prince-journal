import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant =
  | "default"
  | "ghost"
  | "transparent"
  | "outline"
  | "outline-destructive"
  | "destructive"
  | "secondary"
  | "select"
  | "filter-toggle"
  | "overlay";
type Size = "default" | "sm" | "lg" | "icon";
type GhostTone = "default" | "muted" | "destructive";
type GhostSurface = "default" | "mobile-toggle";
type FilterToggleAlign = "center" | "left";
type FilterToggleDensity = "default" | "compact";
type FilterToggleWidth = "full" | "fit";

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const VARIANT: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  outline:
    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  "outline-destructive":
    "border border-destructive/60 bg-background text-destructive shadow-sm hover:bg-destructive/10 hover:text-destructive",
  secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  transparent: "bg-transparent hover:opacity-75",
  select: "h-auto gap-1 rounded-md border px-3 py-1 text-xs font-medium shadow-sm",
  "filter-toggle":
    "filter-toggle gap-1.5 flex cursor-pointer items-center rounded-md border border-border/70 bg-card/50 px-2 py-1 text-xs text-foreground transition-colors hover:border-brass/45 hover:bg-brass/10",
  overlay:
    "fixed inset-x-0 bottom-0 top-14 z-40 rounded-none border-0 bg-black/45 p-0 hover:bg-black/45",
};

const SIZE: Record<Size, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
};

const GHOST_TONE: Record<GhostTone, string> = {
  default: "",
  muted: "text-muted-foreground",
  destructive: "text-destructive hover:text-destructive",
};

const GHOST_SURFACE: Record<GhostSurface, string> = {
  default: "",
  "mobile-toggle": "shrink-0 rounded-full",
};

const GHOST_SURFACE_ACTIVE: Record<GhostSurface, string> = {
  default: "",
  "mobile-toggle": "bg-brass text-brass-foreground",
};

const FILTER_TOGGLE_STATE = {
  on: "filter-toggle-on border-brass bg-brass text-brass-foreground opacity-100",
  off: "filter-toggle-off opacity-75",
};

const FILTER_TOGGLE_ALIGN: Record<FilterToggleAlign, string> = {
  center: "",
  left: "text-left",
};

const FILTER_TOGGLE_DENSITY: Record<FilterToggleDensity, string> = {
  default: "",
  compact: "filter-toggle-compact",
};

const FILTER_TOGGLE_WIDTH: Record<FilterToggleWidth, string> = {
  full: "filter-toggle-full",
  fit: "filter-toggle-fit",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
}

/** General-purpose button. Prefer the pre-styled variants below for common use cases. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "default", size = "default", active = false, className = "", ...props },
  ref,
) {
  let variantClass = VARIANT[variant];
  if (variant === "select") {
    variantClass = active ? "select-btn-active" : "select-btn-inactive";
  }

  let sizeClass = SIZE[size];
  if (variant === "select" || variant === "overlay") {
    sizeClass = "";
  }

  return (
    <button
      ref={ref}
      {...props}
      className={`${BASE} ${variantClass} ${sizeClass} ${className}`.trim()}
    />
  );
});

/** Ghost icon button — used for toolbars and row actions.
 *  Always square, non-shrinking. `type="button"` is set by default. */
export function IconButton({
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      {...props}
      className={`${BASE} ${VARIANT.ghost} ${SIZE.icon} shrink-0 ${className}`.trim()}
    />
  );
}

/** Primary action button styled with the brass accent. */
export function BrassButton({ size = "default", className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${BASE} ${VARIANT.default} ${SIZE[size]} bg-brass text-brass-foreground hover:bg-brass/90 ${className}`.trim()}
    />
  );
}

/** Small ghost button for secondary row/panel actions. */
export function GhostButton({
  size = "sm",
  tone = "default",
  surface = "default",
  active = false,
  ...props
}: Omit<ButtonProps, "className"> & {
  tone?: GhostTone;
  surface?: GhostSurface;
  active?: boolean;
}) {
  let activeClass = "";
  if (active) activeClass = GHOST_SURFACE_ACTIVE[surface];

  return (
    <button
      {...props}
      className={`${BASE} ${VARIANT.ghost} ${SIZE[size]} ${GHOST_TONE[tone]} ${GHOST_SURFACE[surface]} ${activeClass}`.trim()}
    />
  );
}

/** Filter toggle button with typed visual states (active, alignment, density). */
export function FilterToggleButton({
  active = false,
  align = "center",
  density = "default",
  width = "full",
  type = "button",
  children,
  ...props
}: Omit<ButtonProps, "variant" | "size" | "className" | "active"> & {
  active?: boolean;
  align?: FilterToggleAlign;
  density?: FilterToggleDensity;
  width?: FilterToggleWidth;
  children: ReactNode;
}) {
  const stateClass = active ? FILTER_TOGGLE_STATE.on : FILTER_TOGGLE_STATE.off;

  return (
    <Button
      {...props}
      type={type}
      variant="filter-toggle"
      size="sm"
      className={`${stateClass} ${FILTER_TOGGLE_ALIGN[align]} ${FILTER_TOGGLE_DENSITY[density]} ${FILTER_TOGGLE_WIDTH[width]}`.trim()}
    >
      {children}
    </Button>
  );
}

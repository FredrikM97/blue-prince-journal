import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant =
  | "default"
  | "brass"
  | "ghost"
  | "transparent"
  | "outline"
  | "outline-destructive"
  | "destructive"
  | "secondary"
  | "select"
  | "filter-toggle"
  | "overlay";
type Size = "default" | "sm" | "lg" | "icon" | "content";
type GhostTone = "default" | "muted" | "destructive";
type GhostSurface = "default" | "mobile-toggle";
type FilterToggleAlign = "center" | "left";
type FilterToggleDensity = "default" | "compact";
type FilterToggleWidth = "full" | "fit";
type ButtonWidth = "auto" | "full";
type ButtonJustify = "center" | "start" | "between";
type ButtonTextAlign = "center" | "left";
type ButtonDirection = "row" | "column";

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0";

const VARIANT: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  brass: "bg-brass text-brass-foreground shadow hover:bg-brass/90",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
  outline:
    "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  "outline-destructive":
    "border border-destructive/60 bg-background text-destructive shadow-sm hover:bg-destructive/10 hover:text-destructive",
  secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  transparent: "bg-transparent hover:opacity-75",
  select: "h-auto gap-1 rounded-md border px-3 py-1 text-xs font-medium shadow-sm",
  "filter-toggle": "ui-toggle-chip ui-toggle-chip-surface gap-1.5",
  overlay:
    "fixed inset-x-0 bottom-0 top-14 z-40 rounded-none border-0 bg-black/45 p-0 hover:bg-black/45",
};

const SIZE: Record<Size, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  icon: "h-9 w-9",
  content: "h-auto p-0",
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
  on: "ui-toggle-state-on opacity-100",
  off: "ui-toggle-state-off",
};

const FILTER_TOGGLE_ALIGN: Record<FilterToggleAlign, string> = {
  center: "ui-align-center",
  left: "ui-align-left",
};

const FILTER_TOGGLE_DENSITY: Record<FilterToggleDensity, string> = {
  default: "ui-toggle-size-default",
  compact: "ui-toggle-size-compact",
};

const FILTER_TOGGLE_WIDTH: Record<FilterToggleWidth, string> = {
  full: "ui-toggle-width-full",
  fit: "ui-toggle-width-fit",
};

const BUTTON_WIDTH: Record<ButtonWidth, string> = {
  auto: "",
  full: "w-full",
};

const BUTTON_JUSTIFY: Record<ButtonJustify, string> = {
  center: "justify-center",
  start: "justify-start",
  between: "justify-between",
};

const BUTTON_TEXT_ALIGN: Record<ButtonTextAlign, string> = {
  center: "text-center",
  left: "text-left",
};

const BUTTON_DIRECTION: Record<ButtonDirection, string> = {
  row: "flex-row",
  column: "flex-col",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
  tone?: GhostTone;
  surface?: GhostSurface;
  align?: FilterToggleAlign;
  density?: FilterToggleDensity;
  width?: FilterToggleWidth;
  fullWidth?: boolean;
  justify?: ButtonJustify;
  textAlign?: ButtonTextAlign;
  direction?: ButtonDirection;
}

/** General-purpose button. Prefer the pre-styled variants below for common use cases. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "default",
    size = "default",
    active = false,
    tone = "default",
    surface = "default",
    align = "center",
    density = "default",
    width = "full",
    fullWidth = false,
    justify = "center",
    textAlign = "center",
    direction = "row",
    className = "",
    ...props
  },
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

  let variantExtras = "";
  if (variant === "ghost") {
    const activeClass = active ? GHOST_SURFACE_ACTIVE[surface] : "";
    variantExtras = `${GHOST_TONE[tone]} ${GHOST_SURFACE[surface]} ${activeClass}`.trim();
  }
  if (variant === "filter-toggle") {
    const stateClass = active ? FILTER_TOGGLE_STATE.on : FILTER_TOGGLE_STATE.off;
    variantExtras =
      `${stateClass} ${FILTER_TOGGLE_ALIGN[align]} ${FILTER_TOGGLE_DENSITY[density]} ${FILTER_TOGGLE_WIDTH[width]}`.trim();
  }
  const layoutClass = [
    BUTTON_WIDTH[fullWidth ? "full" : "auto"],
    BUTTON_JUSTIFY[justify],
    BUTTON_TEXT_ALIGN[textAlign],
    BUTTON_DIRECTION[direction],
  ]
    .join(" ")
    .trim();
  return (
    <button
      ref={ref}
      {...props}
      className={`${BASE} ${variantClass} ${sizeClass} ${variantExtras} ${layoutClass} ${className}`.trim()}
    />
  );
});

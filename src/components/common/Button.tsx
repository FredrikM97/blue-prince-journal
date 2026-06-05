import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant =
  | "default"
  | "brass"
  | "map-cell"
  | "control-row"
  | "action-link"
  | "ghost"
  | "transparent"
  | "outline"
  | "outline-destructive"
  | "destructive"
  | "secondary"
  | "select"
  | "filter-toggle"
  | "overlay";
type Size = "default" | "sm" | "lg" | "h1" | "h2" | "icon" | "icon-h2" | "content";
type GhostTone = "default" | "muted" | "destructive";
type GhostSurface = "default" | "mobile-toggle";
type FilterToggleAlign = "center" | "left";
type FilterToggleDensity = "default" | "compact";
type FilterToggleWidth = "full" | "fit";
type FilterToggleStateStyle = "filled" | "outline";
type ControlRowWidth = "fill" | "fit";
type ControlRowSize = "default" | "compact";
type ActionLinkSize = "default" | "compact";
type ButtonWidth = "auto" | "full";
type ButtonJustify = "center" | "start" | "between";
type ButtonTextAlign = "center" | "left";
type ButtonDirection = "row" | "column";
type ButtonIconSize = "sm" | "md" | "lg" | "xl" | "2xl" | "hero";

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0";

const MAP_CELL_BASE =
  "inline-flex cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANT: Record<Variant, string> = {
  default: "btn-variant-default",
  brass: "btn-variant-brass",
  "map-cell": "map-cell btn-variant-map-cell",
  "control-row": "ui-control-row",
  "action-link": "ui-action-link",
  destructive: "btn-variant-destructive",
  outline: "btn-variant-outline",
  "outline-destructive": "btn-variant-outline-destructive",
  secondary: "btn-variant-secondary",
  ghost: "btn-variant-ghost",
  transparent: "btn-variant-transparent",
  select: "btn-variant-select",
  "filter-toggle": "btn-variant-filter-toggle",
  overlay: "btn-variant-overlay",
};

const SIZE: Record<Size, string> = {
  default: "h-9 px-4 py-2",
  sm: "h-8 rounded-md px-3 text-xs",
  lg: "h-10 rounded-md px-8",
  h1: "h-10 rounded-md px-8",
  h2: "h-8 rounded-md px-3 text-xs",
  icon: "h-9 w-9",
  "icon-h2": "h-7 w-7",
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

const FILTER_TOGGLE_STATE: Record<FilterToggleStateStyle, { on: string; off: string }> = {
  filled: {
    on: "ui-toggle-state-on-filled opacity-100",
    off: "ui-toggle-state-off",
  },
  outline: {
    on: "ui-toggle-state-on-outline opacity-100",
    off: "ui-toggle-state-off",
  },
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

const CONTROL_ROW_WIDTH: Record<ControlRowWidth, string> = {
  fill: "ui-width-fill",
  fit: "ui-width-fit",
};

const CONTROL_ROW_SIZE: Record<ControlRowSize, string> = {
  default: "ui-control-size-default",
  compact: "ui-control-size-compact",
};

const ACTION_LINK_SIZE: Record<ActionLinkSize, string> = {
  default: "ui-action-link-size-default",
  compact: "ui-action-link-size-compact",
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

const BUTTON_ICON_SIZE: Record<ButtonIconSize, string> = {
  sm: "[&_svg]:size-3.5",
  md: "[&_svg]:size-4",
  lg: "[&_svg]:size-5",
  xl: "[&_svg]:size-6",
  "2xl": "[&_svg]:size-8",
  hero: "[&_svg]:size-20",
};

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
  tone?: GhostTone;
  surface?: GhostSurface;
  align?: FilterToggleAlign;
  density?: FilterToggleDensity;
  width?: FilterToggleWidth;
  toggleStateStyle?: FilterToggleStateStyle;
  controlWidth?: ControlRowWidth;
  controlSize?: ControlRowSize;
  actionSize?: ActionLinkSize;
  fullWidth?: boolean;
  justify?: ButtonJustify;
  textAlign?: ButtonTextAlign;
  direction?: ButtonDirection;
  iconSize?: ButtonIconSize;
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
    toggleStateStyle = "filled",
    controlWidth = "fill",
    controlSize = "default",
    actionSize = "default",
    fullWidth = false,
    justify = "center",
    textAlign = "center",
    direction = "row",
    iconSize = "md",
    ...props
  },
  ref,
) {
  let baseClass = BASE;
  if (variant === "map-cell") {
    baseClass = MAP_CELL_BASE;
  }

  let variantClass = VARIANT[variant];
  if (variant === "select") {
    variantClass = active ? "select-btn-active" : "select-btn-inactive";
  }

  let sizeClass = SIZE[size];
  if (variant === "select" || variant === "overlay" || variant === "map-cell") {
    sizeClass = "";
  }

  let variantExtras = "";
  if (variant === "ghost") {
    const activeClass = active ? GHOST_SURFACE_ACTIVE[surface] : "";
    variantExtras = `${GHOST_TONE[tone]} ${GHOST_SURFACE[surface]} ${activeClass}`.trim();
  }
  if (variant === "filter-toggle") {
    const stateByStyle = FILTER_TOGGLE_STATE[toggleStateStyle];
    const stateClass = active ? stateByStyle.on : stateByStyle.off;
    variantExtras =
      `${stateClass} ${FILTER_TOGGLE_ALIGN[align]} ${FILTER_TOGGLE_DENSITY[density]} ${FILTER_TOGGLE_WIDTH[width]}`.trim();
  }
  if (variant === "control-row") {
    variantExtras = `${CONTROL_ROW_WIDTH[controlWidth]} ${CONTROL_ROW_SIZE[controlSize]}`.trim();
  }
  if (variant === "action-link") {
    variantExtras = ACTION_LINK_SIZE[actionSize];
  }
  const layoutClass = [
    BUTTON_WIDTH[fullWidth ? "full" : "auto"],
    BUTTON_JUSTIFY[justify],
    BUTTON_TEXT_ALIGN[textAlign],
    BUTTON_DIRECTION[direction],
    BUTTON_ICON_SIZE[iconSize],
  ]
    .join(" ")
    .trim();
  return (
    <button
      ref={ref}
      {...props}
      className={`${baseClass} ${variantClass} ${sizeClass} ${variantExtras} ${layoutClass}`.trim()}
    />
  );
});

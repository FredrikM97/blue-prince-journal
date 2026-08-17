import { createElement, forwardRef, type ButtonHTMLAttributes } from "react";

type Variant =
  | "default"
  | "brass"
  | "ghost"
  | "outline"
  | "outline-destructive"
  | "destructive"
  | "secondary";
type Size = "default" | "sm" | "lg" | "h1" | "h2" | "icon" | "icon-h2" | "content";
type GhostTone = "default" | "muted" | "destructive";
type GhostSurface = "default" | "mobile-toggle";
type ButtonWidth = "auto" | "full";
type ButtonJustify = "center" | "start" | "between";
type ButtonTextAlign = "center" | "left";
type ButtonDirection = "row" | "column";
type ButtonIconSize = "sm" | "md" | "lg" | "xl" | "2xl" | "hero";

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors transition-transform active:scale-[0.98] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0";

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
};

const SIZE_SMALL = "h-8 rounded-md px-3 text-xs";
const SIZE_LARGE = "h-10 rounded-md px-8";

const SIZE: Record<Size, string> = {
  default: "h-9 px-4 py-2",
  sm: SIZE_SMALL,
  lg: SIZE_LARGE,
  h1: SIZE_LARGE,
  h2: SIZE_SMALL,
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
  "mobile-toggle": "shrink-0 !rounded-full h-10 px-4 text-sm",
};

const GHOST_SURFACE_ACTIVE: Record<GhostSurface, string> = {
  default: "",
  "mobile-toggle": "bg-brass text-brass-foreground ring-1 ring-inset ring-brass/80",
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

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  active?: boolean;
  tone?: GhostTone;
  surface?: GhostSurface;
  fullWidth?: boolean;
  justify?: ButtonJustify;
  textAlign?: ButtonTextAlign;
  direction?: ButtonDirection;
  iconSize?: ButtonIconSize;
}

function getVariantClass(variant: Variant) {
  return VARIANT[variant];
}

function getVariantExtras(
  variant: Variant,
  options: { active: boolean; tone: GhostTone; surface: GhostSurface },
) {
  if (variant === "ghost") {
    const activeClass = options.active ? GHOST_SURFACE_ACTIVE[options.surface] : "";
    return `${GHOST_TONE[options.tone]} ${GHOST_SURFACE[options.surface]} ${activeClass}`.trim();
  }
  return "";
}

/** General-purpose button. Prefer the pre-styled variants below for common use cases. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "default",
    size = "default",
    active = false,
    tone = "default",
    surface = "default",
    fullWidth = false,
    justify = "center",
    textAlign = "center",
    direction = "row",
    iconSize = "md",
    className,
    ...props
  },
  ref,
) {
  const baseClass = BASE;
  const variantClass = getVariantClass(variant);
  const sizeClass = SIZE[size];
  const variantExtras = getVariantExtras(variant, { active, tone, surface });
  const layoutClass = [
    BUTTON_WIDTH[fullWidth ? "full" : "auto"],
    BUTTON_JUSTIFY[justify],
    BUTTON_TEXT_ALIGN[textAlign],
    BUTTON_DIRECTION[direction],
    BUTTON_ICON_SIZE[iconSize],
    className,
  ]
    .join(" ")
    .trim();
  return createElement("button", {
    ref,
    ...props,
    className: `${baseClass} ${variantClass} ${sizeClass} ${variantExtras} ${layoutClass}`.trim(),
  });
});

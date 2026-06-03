import { createElement, type ReactNode } from "react";

type TextElement = "p" | "span" | "div" | "label" | "ul" | "li" | "code";
type TextSize = "xs" | "sm" | "base" | "3xl";
type TextTone = "default" | "muted";
type TextWeight = "normal" | "medium" | "semibold";
type TextMarginTop = "0" | "0.5" | "1" | "2";
type TextLeading = "normal" | "tight" | "relaxed";
type TextIntent = "default" | "warning";
type TextDecoration = "none" | "line-through";
type TextVariant =
  | "default"
  | "sr-only"
  | "panel-card"
  | "panel-row"
  | "preview-field-label"
  | "preview-field-value"
  | "app-brand-badge"
  | "app-brand-title"
  | "sync-folder-name"
  | "feedback-build-code"
  | "graph-toolbar-hint"
  | "graph-legend-label";

const TEXT_SIZE_CLASS: Record<TextSize, string> = {
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  "3xl": "text-3xl",
};

const TEXT_TONE_CLASS: Record<TextTone, string> = {
  default: "text-foreground",
  muted: "text-muted-foreground",
};

const TEXT_WEIGHT_CLASS: Record<TextWeight, string> = {
  normal: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
};

const TEXT_MARGIN_TOP_CLASS: Record<TextMarginTop, string> = {
  "0": "",
  "0.5": "mt-0.5",
  "1": "mt-1",
  "2": "mt-2",
};

const TEXT_LEADING_CLASS: Record<TextLeading, string> = {
  normal: "leading-normal",
  tight: "leading-tight",
  relaxed: "leading-relaxed",
};

const TEXT_INTENT_CLASS: Record<TextIntent, string> = {
  default: "",
  warning: "text-amber-600 dark:text-amber-400",
};

const TEXT_VARIANT_CLASS: Record<TextVariant, string> = {
  default: "",
  "sr-only": "sr-only",
  "panel-card": "panel-card",
  "panel-row": "panel-row",
  "preview-field-label": "preview-field-label",
  "preview-field-value": "preview-field-value",
  "app-brand-badge": "app-brand-badge",
  "app-brand-title": "app-brand-title",
  "sync-folder-name": "sync-folder-name",
  "feedback-build-code": "feedback-build-code",
  "graph-toolbar-hint": "graph-toolbar-hint",
  "graph-legend-label": "graph-legend-label",
};

type HeadingElement = "h1" | "h2" | "h3";
type HeadingSize = "3xl" | "2xl" | "xl" | "lg" | "base";
type HeadingLeading = "normal" | "snug";
type HeadingVariant = "default" | "section-label" | "settings-section-title";

const HEADING_SIZE_CLASS: Record<HeadingSize, string> = {
  "3xl": "text-3xl",
  "2xl": "text-2xl",
  xl: "text-xl",
  lg: "text-lg",
  base: "text-base",
};

const HEADING_LEADING_CLASS: Record<HeadingLeading, string> = {
  normal: "leading-normal",
  snug: "leading-snug",
};

const HEADING_VARIANT_CLASS: Record<HeadingVariant, string> = {
  default: "",
  "section-label": "section-label",
  "settings-section-title": "settings-section-title",
};

export function Text({
  as = "p",
  size = "sm",
  tone = "default",
  weight = "normal",
  marginTop = "0",
  leading = "normal",
  intent = "default",
  decoration = "none",
  variant = "default",
  truncate = false,
  tabular = false,
  minWidthZero = false,
  capitalize = false,
  title,
  children,
}: {
  as?: TextElement;
  size?: TextSize;
  tone?: TextTone;
  weight?: TextWeight;
  marginTop?: TextMarginTop;
  leading?: TextLeading;
  intent?: TextIntent;
  decoration?: TextDecoration;
  variant?: TextVariant;
  truncate?: boolean;
  tabular?: boolean;
  minWidthZero?: boolean;
  capitalize?: boolean;
  title?: string;
  children: ReactNode;
}) {
  let baseClass = `${TEXT_SIZE_CLASS[size]} ${TEXT_TONE_CLASS[tone]} ${TEXT_WEIGHT_CLASS[weight]} ${TEXT_MARGIN_TOP_CLASS[marginTop]} ${TEXT_LEADING_CLASS[leading]} ${TEXT_INTENT_CLASS[intent]} ${TEXT_VARIANT_CLASS[variant]}`;
  if (decoration === "line-through") baseClass = `${baseClass} line-through`;
  if (truncate) baseClass = `${baseClass} truncate`;
  if (tabular) baseClass = `${baseClass} tabular-nums`;
  if (minWidthZero) baseClass = `${baseClass} min-w-0`;
  if (capitalize) baseClass = `${baseClass} capitalize`;
  return createElement(as, { className: baseClass.trim(), title }, children);
}

export function Heading({
  as = "h2",
  size = "xl",
  leading = "normal",
  variant = "default",
  muted = false,
  children,
}: {
  as?: HeadingElement;
  size?: HeadingSize;
  leading?: HeadingLeading;
  variant?: HeadingVariant;
  muted?: boolean;
  children: ReactNode;
}) {
  let toneClass = "text-foreground";
  if (muted) toneClass = "text-muted-foreground";
  const baseClass = `${HEADING_SIZE_CLASS[size]} ${HEADING_LEADING_CLASS[leading]} ${toneClass} ${HEADING_VARIANT_CLASS[variant]}`;
  return createElement(as, { className: baseClass.trim() }, children);
}

export function MetaText({
  as = "p",
  size = "xs",
  weight = "normal",
  marginTop = "0",
  truncate = false,
  tabular = false,
  capitalize = false,
  normalCase = false,
  opacity = "100",
  leading = "normal",
  variant = "default",
  title,
  children,
}: {
  as?: TextElement;
  size?: TextSize;
  weight?: TextWeight;
  marginTop?: TextMarginTop;
  truncate?: boolean;
  tabular?: boolean;
  capitalize?: boolean;
  normalCase?: boolean;
  opacity?: "100" | "70";
  leading?: TextLeading;
  variant?: TextVariant;
  title?: string;
  children: ReactNode;
}) {
  let textClass = "";
  if (normalCase) textClass = "normal-case";
  if (opacity === "70") textClass = `${textClass} opacity-70`.trim();

  return (
    <Text
      as={as}
      size={size}
      tone="muted"
      weight={weight}
      marginTop={marginTop}
      truncate={truncate}
      tabular={tabular}
      capitalize={capitalize}
      leading={leading}
      variant={variant}
      title={title}
    >
      {textClass ? <span className={textClass}>{children}</span> : children}
    </Text>
  );
}

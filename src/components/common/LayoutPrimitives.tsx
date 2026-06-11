import { createElement, type ReactNode } from "react";

type InlineElement = "div" | "section" | "header" | "footer" | "label";
type InlineGap = "1" | "1.5" | "2" | "3";
type InlineAlign = "start" | "center" | "end";
type InlineJustify = "start" | "center" | "between" | "end";
type GridElement = "div" | "section" | "ul";
type GridGap = "2" | "3" | "4";
type GridVariant = "default" | "gallery" | "cols-3-md" | "auto-fill-card";

function inlineGapClass(gap: InlineGap) {
  if (gap === "1") return "gap-1";
  if (gap === "1.5") return "gap-1.5";
  if (gap === "2") return "gap-2";
  return "gap-3";
}

function inlineAlignClass(align: InlineAlign) {
  if (align === "start") return "items-start";
  if (align === "end") return "items-end";
  return "items-center";
}

function inlineJustifyClass(justify: InlineJustify) {
  if (justify === "start") return "justify-start";
  if (justify === "center") return "justify-center";
  if (justify === "end") return "justify-end";
  return "justify-between";
}

export function Inline({
  as = "div",
  gap = "2",
  align = "center",
  justify = "start",
  wrap = false,
  className = "",
  children,
}: {
  as?: InlineElement;
  gap?: InlineGap;
  align?: InlineAlign;
  justify?: InlineJustify;
  wrap?: boolean;
  className?: string;
  children: ReactNode;
}) {
  let classes = `inline-row flex ${inlineGapClass(gap)} ${inlineAlignClass(align)} ${inlineJustifyClass(justify)}`;
  if (wrap) classes = `${classes} flex-wrap`;
  if (className) classes = `${classes} ${className}`;
  return createElement(as, { className: classes.trim() }, children);
}

function gridGapClass(gap: GridGap) {
  if (gap === "2") return "gap-2";
  if (gap === "4") return "gap-4";
  return "gap-3";
}

function gridVariantClass(variant: GridVariant) {
  if (variant === "gallery") return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
  if (variant === "cols-3-md") return "md:grid-cols-3";
  if (variant === "auto-fill-card") {
    return "[grid-template-columns:repeat(auto-fill,minmax(8rem,1fr))]";
  }
  return "";
}

export function Grid({
  as = "div",
  gap = "3",
  variant = "default",
  className = "",
  children,
}: {
  as?: GridElement;
  gap?: GridGap;
  variant?: GridVariant;
  className?: string;
  children: ReactNode;
}) {
  let classes = `grid ${gridGapClass(gap)} ${gridVariantClass(variant)}`;
  if (className) classes = `${classes} ${className}`;
  return createElement(as, { className: classes.trim() }, children);
}

export function SectionBlock({ children }: { children: ReactNode }) {
  return <section className="border-t border-border pt-6">{children}</section>;
}

export function SectionHeader({
  density = "default",
  children,
}: {
  density?: "default" | "compact";
  children: ReactNode;
}) {
  let className = "mb-2 flex items-center justify-between gap-2";
  if (density === "compact") {
    className = "mb-1.5 flex items-center justify-between gap-1.5";
  }
  return <header className={className}>{children}</header>;
}

export function SectionHeaderActions({
  density = "default",
  children,
}: {
  density?: "default" | "compact";
  children: ReactNode;
}) {
  let className = "flex items-center gap-1";
  if (density === "compact") {
    className = "flex items-center gap-1";
  }
  return (
    <Inline as="div" gap="1" align="center" className={className}>
      {children}
    </Inline>
  );
}
export function CenteredContent({
  max = "6xl",
  align = "center",
  children,
}: {
  max?: "2xl" | "6xl";
  align?: "center" | "left";
  children: ReactNode;
}) {
  let maxClass = "max-w-6xl";
  if (max === "2xl") maxClass = "max-w-2xl";
  let alignClass = "text-center";
  if (align === "left") alignClass = "text-left";
  return <div className={`w-full space-y-8 ${maxClass} ${alignClass}`}>{children}</div>;
}

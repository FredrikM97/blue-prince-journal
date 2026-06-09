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
  if (gap === "2") return "grid-gap-2";
  if (gap === "4") return "grid-gap-4";
  return "grid-gap-3";
}

function gridVariantClass(variant: GridVariant) {
  if (variant === "gallery") return "grid-gallery";
  if (variant === "cols-3-md") return "grid-cols-3-md";
  if (variant === "auto-fill-card") return "grid-auto-fill-card";
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
  let classes = `grid-layout ${gridGapClass(gap)} ${gridVariantClass(variant)}`;
  if (className) classes = `${classes} ${className}`;
  return createElement(as, { className: classes.trim() }, children);
}

export function SectionBlock({ children }: { children: ReactNode }) {
  return <section className="section-block">{children}</section>;
}

export function SectionHeader({
  density = "default",
  children,
}: {
  density?: "default" | "compact";
  children: ReactNode;
}) {
  let className = "section-header-row";
  if (density === "compact") {
    className = `${className} section-header-row-compact`;
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
  let className = "section-actions";
  if (density === "compact") {
    className = `${className} section-actions-compact`;
  }
  return (
    <Inline as="div" gap="1" align="center" className={className}>
      {children}
    </Inline>
  );
}

type PageLayoutMobileDrawerSide = "left" | "right";
type PageLayoutSidebarSide = "left" | "right";

export function PageLayoutFrame({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

export function PageLayoutMobileControls({ children }: { children: ReactNode }) {
  return <div className="ui-layout-mobile-controls">{children}</div>;
}

export function PageLayoutMobileDrawer({
  side,
  children,
}: {
  side: PageLayoutMobileDrawerSide;
  children: ReactNode;
}) {
  let className = "ui-layout-mobile-drawer ui-layout-mobile-drawer-left";
  if (side === "right") {
    className = "ui-layout-mobile-drawer ui-layout-mobile-drawer-right";
  }
  return <aside className={className}>{children}</aside>;
}

export function PageLayoutSidebar({
  side,
  children,
}: {
  side: PageLayoutSidebarSide;
  children: ReactNode;
}) {
  let className = "ui-layout-sidebar-left";
  if (side === "right") {
    className = "ui-layout-sidebar-right";
  }
  return <aside className={className}>{children}</aside>;
}

export function PageLayoutContent({ children }: { children: ReactNode }) {
  return <main className="ui-layout-content">{children}</main>;
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
  let maxClass = "content-max-6xl";
  if (max === "2xl") maxClass = "content-max-2xl";
  let alignClass = "content-align-center";
  if (align === "left") alignClass = "content-align-left";
  return <div className={`content-stack ${maxClass} ${alignClass}`}>{children}</div>;
}

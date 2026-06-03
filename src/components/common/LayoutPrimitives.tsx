import { createElement, type ReactNode } from "react";

type InlineElement = "div" | "section" | "header" | "footer" | "label";
type InlineGap = "1" | "1.5" | "2" | "3";
type InlineAlign = "start" | "center" | "end";
type InlineJustify = "start" | "center" | "between" | "end";

function inlineGapClass(gap: InlineGap) {
  if (gap === "1") return "inline-gap-1";
  if (gap === "1.5") return "inline-gap-1_5";
  if (gap === "2") return "inline-gap-2";
  return "inline-gap-3";
}

function inlineAlignClass(align: InlineAlign) {
  if (align === "start") return "inline-align-start";
  if (align === "end") return "inline-align-end";
  return "inline-align-center";
}

function inlineJustifyClass(justify: InlineJustify) {
  if (justify === "start") return "inline-justify-start";
  if (justify === "center") return "inline-justify-center";
  if (justify === "end") return "inline-justify-end";
  return "inline-justify-between";
}

export function Inline({
  as = "div",
  gap = "2",
  align = "center",
  justify = "start",
  wrap = false,
  children,
}: {
  as?: InlineElement;
  gap?: InlineGap;
  align?: InlineAlign;
  justify?: InlineJustify;
  wrap?: boolean;
  children: ReactNode;
}) {
  let classes = `inline-row ${inlineGapClass(gap)} ${inlineAlignClass(align)} ${inlineJustifyClass(justify)}`;
  if (wrap) classes = `${classes} inline-wrap`;
  return createElement(as, { className: classes }, children);
}

export function SectionBlock({ children }: { children: ReactNode }) {
  return <section className="section-block">{children}</section>;
}

export function SectionHeader({ children }: { children: ReactNode }) {
  return <header className="section-header-row">{children}</header>;
}

export function SectionHeaderActions({ children }: { children: ReactNode }) {
  return (
    <Inline as="div" gap="1" align="center">
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
  return <div className="page-layout-mobile-controls lg:hidden">{children}</div>;
}

export function PageLayoutMobileDrawer({
  side,
  children,
}: {
  side: PageLayoutMobileDrawerSide;
  children: ReactNode;
}) {
  let className = "page-layout-mobile-drawer page-layout-mobile-drawer-left lg:hidden";
  if (side === "right") {
    className = "page-layout-mobile-drawer page-layout-mobile-drawer-right lg:hidden";
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
  let className = "page-layout-sidebar page-layout-sidebar-desktop";
  if (side === "right") {
    className = "page-layout-rightbar page-layout-rightbar-desktop";
  }
  return <aside className={className}>{children}</aside>;
}

export function PageLayoutContent({ children }: { children: ReactNode }) {
  return <main className="page-layout-content">{children}</main>;
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

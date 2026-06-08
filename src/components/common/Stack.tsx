import { createElement, type ReactNode } from "react";

type StackElement =
  | "div"
  | "section"
  | "header"
  | "footer"
  | "aside"
  | "ul"
  | "li"
  | "nav"
  | "form"
  | "span";
type StackGap = "0" | "1" | "1.5" | "2" | "3" | "4" | "5";
type StackVariant =
  | "default"
  | "panel-card"
  | "dialog-scroll-body"
  | "graph-canvas-frame"
  | "graph-canvas-frame-plain"
  | "graph-toolbar"
  | "graph-toolbar-controls"
  | "graph-legend-row"
  | "graph-legend-item"
  | "markdown-preview-surface"
  | "md-toolbar"
  | "md-editor-shell"
  | "md-editor-body"
  | "md-toolbar-divider"
  | "item-shell"
  | "item-pad-sm"
  | "item-pad-md"
  | "item-content"
  | "item-header"
  | "item-title"
  | "item-meta"
  | "todos-column"
  | "todos-column-header"
  | "todos-column-list"
  | "todos-column-empty"
  | "dialog-scroll-body-tall"
  | "image-zoom-dialog-shell"
  | "image-zoom-toolbar";
type StackMarginTop = "0" | "2";

const STACK_GAP_CLASS: Record<StackGap, string> = {
  "0": "",
  "1": "space-y-1",
  "1.5": "space-y-1.5",
  "2": "space-y-2",
  "3": "space-y-3",
  "4": "space-y-4",
  "5": "space-y-5",
};

const STACK_VARIANT_CLASS: Record<StackVariant, string> = {
  default: "",
  "panel-card": "panel-card",
  "dialog-scroll-body": "dialog-scroll-body",
  "graph-canvas-frame": "graph-canvas-frame",
  "graph-canvas-frame-plain": "graph-canvas-frame-plain",
  "graph-toolbar": "graph-toolbar",
  "graph-toolbar-controls": "graph-toolbar-controls",
  "graph-legend-row": "graph-legend-row",
  "graph-legend-item": "graph-legend-item",
  "markdown-preview-surface":
    "markdown-preview-surface prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed",
  "md-toolbar": "md-toolbar",
  "md-editor-shell": "md-editor-shell",
  "md-editor-body": "md-editor-body",
  "md-toolbar-divider": "mx-1 h-4 w-px bg-border",
  "item-shell": "item-shell",
  "item-pad-sm": "item-pad-sm",
  "item-pad-md": "item-pad-md",
  "item-content": "item-content",
  "item-header": "item-header",
  "item-title": "item-title",
  "item-meta": "item-meta",
  "todos-column": "todos-column",
  "todos-column-header": "todos-column-header",
  "todos-column-list": "todos-column-list",
  "todos-column-empty": "todos-column-empty",
  "dialog-scroll-body-tall": "dialog-scroll-body min-h-[68vh]",
  "image-zoom-dialog-shell": "image-zoom-dialog-shell",
  "image-zoom-toolbar": "image-zoom-toolbar",
};

const STACK_MARGIN_TOP_CLASS: Record<StackMarginTop, string> = {
  "0": "",
  "2": "mt-2",
};

export function Stack({
  as = "div",
  gap = "3",
  variant = "default",
  marginTop = "0",
  className = "",
  role,
  ariaLabel,
  children,
}: {
  as?: StackElement;
  gap?: StackGap;
  variant?: StackVariant;
  marginTop?: StackMarginTop;
  className?: string;
  role?: string;
  ariaLabel?: string;
  children?: ReactNode;
}) {
  const resolvedClassName = `${STACK_GAP_CLASS[gap]} ${STACK_VARIANT_CLASS[variant]} ${STACK_MARGIN_TOP_CLASS[marginTop]} ${className}`;
  return createElement(
    as,
    { className: resolvedClassName.trim(), role, "aria-label": ariaLabel },
    children,
  );
}

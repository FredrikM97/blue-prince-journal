import { createElement, type ReactNode } from "react";

type StackElement =
  | "div"
  | "section"
  | "header"
  | "footer"
  | "aside"
  | "ul"
  | "nav"
  | "form"
  | "span";
type StackGap = "0" | "1" | "1.5" | "2" | "3" | "4" | "5";
type StackVariant =
  | "default"
  | "page-layout-panel"
  | "panel-card"
  | "dialog-scroll-body"
  | "notes-view-section"
  | "notes-view-empty"
  | "notes-view-list"
  | "note-row-item"
  | "note-row-inner"
  | "app-header"
  | "app-header-inner"
  | "app-nav"
  | "app-header-controls"
  | "app-search-wrap"
  | "welcome-shell"
  | "welcome-icon"
  | "graph-page-middle"
  | "graph-canvas-frame"
  | "graph-canvas-frame-plain"
  | "graph-toolbar"
  | "graph-toolbar-controls"
  | "graph-zoom-controls"
  | "graph-legend-row"
  | "graph-legend-item"
  | "panel-header"
  | "panel-header-title-wrap"
  | "preview-header-actions"
  | "side-panel-shell"
  | "note-details-images"
  | "note-details-images-compact"
  | "note-details-images-header"
  | "note-details-images-label"
  | "note-details-zoom-preview"
  | "image-card-strip"
  | "note-image-picker-grid"
  | "images-grid"
  | "markdown-preview-surface"
  | "filter-section"
  | "filter-section-header"
  | "filter-section-body"
  | "filter-grid"
  | "filter-grid-wrap"
  | "filter-options";
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
  "page-layout-panel": "ui-surface-panel",
  "panel-card": "panel-card",
  "dialog-scroll-body": "dialog-scroll-body",
  "notes-view-section": "notes-view-section",
  "notes-view-empty": "notes-view-empty",
  "notes-view-list": "notes-view-list",
  "note-row-item": "note-row-item",
  "note-row-inner": "note-row-inner group",
  "app-header": "app-header",
  "app-header-inner": "app-header-inner",
  "app-nav": "app-nav",
  "app-header-controls": "app-header-controls",
  "app-search-wrap": "app-search-wrap",
  "welcome-shell": "welcome-shell",
  "welcome-icon": "welcome-icon",
  "graph-page-middle": "graph-page-middle",
  "graph-canvas-frame": "graph-canvas-frame",
  "graph-canvas-frame-plain": "graph-canvas-frame-plain",
  "graph-toolbar": "graph-toolbar",
  "graph-toolbar-controls": "graph-toolbar-controls",
  "graph-zoom-controls": "flex items-center",
  "graph-legend-row": "graph-legend-row",
  "graph-legend-item": "graph-legend-item",
  "panel-header": "ui-header-panel",
  "panel-header-title-wrap": "ui-header-title-wrap",
  "preview-header-actions": "ui-header-actions",
  "side-panel-shell": "ui-shell-panel",
  "note-details-images": "note-details-images",
  "note-details-images-compact": "note-details-images-compact",
  "note-details-images-header": "mb-2",
  "note-details-images-label": "note-details-images-label",
  "note-details-zoom-preview": "note-details-zoom-preview",
  "image-card-strip": "image-card-strip",
  "note-image-picker-grid": "note-image-picker-grid",
  "images-grid": "images-grid",
  "markdown-preview-surface":
    "markdown-preview-surface prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed",
  "filter-section": "ui-block-tight",
  "filter-section-header": "ui-header-row",
  "filter-section-body": "ui-body-tight",
  "filter-grid": "ui-grid-auto-fit",
  "filter-grid-wrap": "ui-wrap-controls",
  "filter-options": "ui-wrap-controls",
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
  children,
}: {
  as?: StackElement;
  gap?: StackGap;
  variant?: StackVariant;
  marginTop?: StackMarginTop;
  className?: string;
  children: ReactNode;
}) {
  const resolvedClassName = `${STACK_GAP_CLASS[gap]} ${STACK_VARIANT_CLASS[variant]} ${STACK_MARGIN_TOP_CLASS[marginTop]} ${className}`;
  return createElement(as, { className: resolvedClassName.trim() }, children);
}

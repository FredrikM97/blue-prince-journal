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
  | "page-layout-panel"
  | "panel-card"
  | "dialog-scroll-body"
  | "notes-view-section"
  | "notes-view-empty"
  | "notes-view-list"
  | "app-header"
  | "app-header-inner"
  | "app-nav"
  | "app-header-controls"
  | "app-search-wrap"
  | "welcome-shell"
  | "welcome-icon"
  | "welcome-card"
  | "section-rule"
  | "settings-subsection"
  | "map-layout-main"
  | "graph-page-middle"
  | "graph-canvas-frame"
  | "graph-canvas-frame-plain"
  | "graph-toolbar"
  | "graph-toolbar-controls"
  | "graph-zoom-controls"
  | "graph-zoom-btn-minus"
  | "graph-zoom-btn-plus"
  | "graph-legend-row"
  | "graph-legend-item"
  | "panel-header"
  | "panel-header-title-wrap"
  | "preview-header-actions"
  | "side-panel-shell"
  | "note-details-images"
  | "note-details-images-header"
  | "note-details-images-label"
  | "image-card-strip"
  | "markdown-preview-surface"
  | "filter-section"
  | "filter-section-header"
  | "filter-section-header-default"
  | "filter-section-header-compact"
  | "filter-section-body"
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
  | "todo-row-item"
  | "todo-row-main"
  | "todo-row-title-line"
  | "todo-row-title-wrap"
  | "todo-row-title-button-wrap"
  | "todo-row-tags-line"
  | "images-detail-preview"
  | "deleted-import-thumb"
  | "deleted-import-thumb-stage"
  | "deleted-import-thumb-action"
  | "deleted-import-thumb-overlay"
  | "deleted-import-thumb-fallback"
  | "dialog-scroll-body-tall"
  | "note-row-item"
  | "note-row-inner"
  | "note-summary-wrap"
  | "note-summary-body"
  | "note-summary-meta"
  | "note-summary-pills"
  | "note-summary-time"
  | "note-summary-tags-date"
  | "note-pill-date"
  | "note-pill-solved"
  | "note-summary-image-count"
  | "note-summary-icon-clue"
  | "note-summary-icon-code"
  | "note-summary-icon-observation"
  | "note-summary-icon-theory"
  | "note-summary-icon-story"
  | "note-summary-icon-task"
  | "image-zoom-dialog-shell"
  | "image-zoom-toolbar"
  | "centered-empty-message";
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
  "app-header": "app-header",
  "app-header-inner": "app-header-inner",
  "app-nav": "app-nav",
  "app-header-controls": "app-header-controls",
  "app-search-wrap": "app-search-wrap",
  "welcome-shell": "welcome-shell",
  "welcome-icon": "welcome-icon",
  "welcome-card": "welcome-card",
  "section-rule": "section-rule",
  "settings-subsection": "settings-subsection",
  "map-layout-main": "map-layout-main",
  "graph-page-middle": "graph-page-middle",
  "graph-canvas-frame": "graph-canvas-frame",
  "graph-canvas-frame-plain": "graph-canvas-frame-plain",
  "graph-toolbar": "graph-toolbar",
  "graph-toolbar-controls": "graph-toolbar-controls",
  "graph-zoom-controls": "flex items-center",
  "graph-zoom-btn-minus": "graph-zoom-btn graph-zoom-btn-minus",
  "graph-zoom-btn-plus": "graph-zoom-btn graph-zoom-btn-plus",
  "graph-legend-row": "graph-legend-row",
  "graph-legend-item": "graph-legend-item",
  "panel-header": "ui-header-panel",
  "panel-header-title-wrap": "ui-header-title-wrap",
  "preview-header-actions": "ui-header-actions",
  "side-panel-shell": "ui-shell-panel",
  "note-details-images": "note-details-images",
  "note-details-images-header": "mb-2",
  "note-details-images-label": "note-details-images-label",
  "image-card-strip": "image-card-strip",
  "markdown-preview-surface":
    "markdown-preview-surface prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed",
  "filter-section": "ui-block-tight",
  "filter-section-header": "ui-header-row",
  "filter-section-header-default": "ui-header-row ui-header-text-default",
  "filter-section-header-compact": "ui-header-row ui-header-text-default ui-header-text-compact",
  "filter-section-body": "ui-body-tight",
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
  "todo-row-item": "todo-row-item",
  "todo-row-main": "todo-row-main",
  "todo-row-title-line": "todo-row-title-line",
  "todo-row-title-wrap": "todo-row-title-wrap",
  "todo-row-title-button-wrap": "todo-row-title-button-wrap",
  "todo-row-tags-line": "todo-row-tags-line",
  "images-detail-preview": "images-detail-preview",
  "deleted-import-thumb": "deleted-import-thumb",
  "deleted-import-thumb-stage": "deleted-import-thumb-stage",
  "deleted-import-thumb-action": "deleted-import-thumb-action",
  "deleted-import-thumb-overlay": "deleted-import-thumb-overlay",
  "deleted-import-thumb-fallback": "deleted-import-thumb-fallback",
  "dialog-scroll-body-tall": "dialog-scroll-body min-h-[68vh]",
  "note-row-item": "note-row-item",
  "note-row-inner": "note-row-inner",
  "note-summary-wrap": "note-summary-wrap",
  "note-summary-body": "note-summary-body",
  "note-summary-meta": "note-summary-meta",
  "note-summary-pills": "note-summary-pills",
  "note-summary-time": "note-summary-time",
  "note-summary-tags-date": "note-summary-tags-date",
  "note-pill-date": "note-pill note-pill-date",
  "note-pill-solved": "note-pill note-pill-solved",
  "note-summary-image-count": "note-summary-image-count",
  "note-summary-icon-clue": "note-summary-icon note-summary-icon-clue",
  "note-summary-icon-code": "note-summary-icon note-summary-icon-code",
  "note-summary-icon-observation": "note-summary-icon note-summary-icon-observation",
  "note-summary-icon-theory": "note-summary-icon note-summary-icon-theory",
  "note-summary-icon-story": "note-summary-icon note-summary-icon-story",
  "note-summary-icon-task": "note-summary-icon note-summary-icon-task",
  "image-zoom-dialog-shell": "image-zoom-dialog-shell",
  "image-zoom-toolbar": "image-zoom-toolbar",
  "centered-empty-message": "flex items-center justify-center py-8",
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
  role,
  ariaLabel,
  children,
}: {
  as?: StackElement;
  gap?: StackGap;
  variant?: StackVariant;
  marginTop?: StackMarginTop;
  role?: string;
  ariaLabel?: string;
  children?: ReactNode;
}) {
  const resolvedClassName = `${STACK_GAP_CLASS[gap]} ${STACK_VARIANT_CLASS[variant]} ${STACK_MARGIN_TOP_CLASS[marginTop]}`;
  return createElement(
    as,
    { className: resolvedClassName.trim(), role, "aria-label": ariaLabel },
    children,
  );
}

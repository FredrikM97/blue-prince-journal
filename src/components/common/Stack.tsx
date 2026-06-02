import { createElement, type ReactNode } from "react";

type StackElement = "div" | "section" | "header" | "footer" | "aside" | "ul";
type StackGap = "1" | "1.5" | "2" | "3" | "4" | "5";
type StackVariant = "default" | "page-layout-panel" | "panel-card" | "dialog-scroll-body";
type StackMarginTop = "0" | "2";

const STACK_GAP_CLASS: Record<StackGap, string> = {
  "1": "space-y-1",
  "1.5": "space-y-1.5",
  "2": "space-y-2",
  "3": "space-y-3",
  "4": "space-y-4",
  "5": "space-y-5",
};

const STACK_VARIANT_CLASS: Record<StackVariant, string> = {
  default: "",
  "page-layout-panel": "page-layout-panel",
  "panel-card": "panel-card",
  "dialog-scroll-body": "dialog-scroll-body",
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
  children,
}: {
  as?: StackElement;
  gap?: StackGap;
  variant?: StackVariant;
  marginTop?: StackMarginTop;
  children: ReactNode;
}) {
  const className = `${STACK_GAP_CLASS[gap]} ${STACK_VARIANT_CLASS[variant]} ${STACK_MARGIN_TOP_CLASS[marginTop]}`;
  return createElement(as, { className: className.trim() }, children);
}

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
  | "dialog-scroll-body";
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
  "panel-card": "rounded-md border border-border bg-card p-3",
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

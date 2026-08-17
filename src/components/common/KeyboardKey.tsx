import { createElement, type HTMLAttributes } from "react";

type KeyboardKeyVariant = "default" | "shortcut";

const KEYBOARD_KEY_CLASS: Record<KeyboardKeyVariant, string> = {
  default: "rounded bg-accent px-1 font-mono text-xs",
  shortcut:
    "rounded border border-black/15 bg-accent px-1 py-0 font-mono text-[11px] leading-4 text-foreground/90",
};

export function KeyboardKey({
  variant = "default",
  className = "",
  ...props
}: HTMLAttributes<HTMLElement> & { variant?: KeyboardKeyVariant }) {
  return createElement("kbd", {
    ...props,
    className: `${KEYBOARD_KEY_CLASS[variant]} ${className}`.trim(),
  });
}

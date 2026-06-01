import type { HTMLAttributes } from "react";

export function KeyboardKey(props: HTMLAttributes<HTMLElement>) {
  return <kbd {...props} className="rounded bg-accent px-1 font-mono text-xs" />;
}

import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[16rem] items-center justify-center rounded-xl border border-dashed border-border/70 bg-gradient-to-b from-background to-muted/25 p-6 text-center shadow-[inset_0_1px_0_0_var(--color-border)]">
      <div className="max-w-md text-sm font-medium text-foreground/90">{children}</div>
    </div>
  );
}

import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[16rem] items-center justify-center rounded-lg border border-dashed border-border p-10 text-center">
      <div className="max-w-md text-sm font-medium text-foreground/90">{children}</div>
    </div>
  );
}

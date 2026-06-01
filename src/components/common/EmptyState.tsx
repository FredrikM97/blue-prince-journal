import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="page-layout-panel empty-state">{children}</div>;
}

import type { ReactNode } from "react";

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="ui-surface-panel empty-state">{children}</div>;
}

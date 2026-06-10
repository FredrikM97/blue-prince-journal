import type { ReactNode } from "react";

type PageLayoutMobileDrawerSide = "left" | "right";
type PageLayoutSidebarSide = "left" | "right";

export function PageLayoutFrame({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return <div className={className}>{children}</div>;
}

export function PageLayoutMobileControls({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-2 z-30 mx-auto flex w-fit items-center gap-2 rounded-full bg-background px-2 py-1.5 shadow-lg backdrop-blur">
      {children}
    </div>
  );
}

export function PageLayoutMobileDrawer({
  side,
  children,
}: {
  side: PageLayoutMobileDrawerSide;
  children: ReactNode;
}) {
  let className =
    "fixed bottom-0 top-0 left-0 z-50 h-dvh max-h-dvh w-[min(94vw,24rem)] max-w-[min(94vw,24rem)] rounded-none border border-r border-border bg-background px-3 pb-3 shadow-xl";
  if (side === "right") {
    className =
      "fixed bottom-0 top-0 right-0 z-50 h-dvh max-h-dvh w-[min(94vw,24rem)] max-w-[min(94vw,24rem)] rounded-none border border-l border-border bg-background px-3 pb-3 shadow-xl";
  }
  return <aside className={className}>{children}</aside>;
}

export function PageLayoutSidebar({
  side,
  children,
}: {
  side: PageLayoutSidebarSide;
  children: ReactNode;
}) {
  let className =
    "sticky top-0 min-h-0 h-full max-h-full self-start overflow-y-auto rounded-l-lg border-r border-border bg-transparent [overscroll-behavior:contain]";
  if (side === "right") {
    className =
      "sticky top-0 min-h-0 h-full max-h-full self-start overflow-y-auto rounded-r-lg border-l border-border bg-transparent [overscroll-behavior:contain]";
  }
  return <aside className={className}>{children}</aside>;
}

export function PageLayoutContent({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-0 min-w-0 h-full overflow-y-auto [overscroll-behavior:contain]">
      {children}
    </main>
  );
}
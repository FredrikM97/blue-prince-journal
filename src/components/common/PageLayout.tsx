/* eslint-disable react-refresh/only-export-components */
import {
  Children,
  Fragment,
  useCallback,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from "react";
import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/common/Button";
import {
  useIsPageLayoutMobile,
  useOnPageLayoutMobileChange,
} from "@/hooks/usePageLayoutMobile";
import { PanelLeft, PanelRight } from "lucide-react";
import {
  PageLayoutMobileDrawerProvider,
  type MobileDrawerSide,
} from "@/hooks/usePageLayoutMobileDrawer";
import { resolveMobilePanelLabels, type MobilePanelLabels } from "@/routes/mobilePanelLabels";

type PageLayoutSlotProps = {
  children: ReactNode;
};

type PageLayoutVariant = "default" | "panel";

function PageLayoutLeft({ children }: PageLayoutSlotProps) {
  return <Fragment>{children}</Fragment>;
}

function PageLayoutMiddle({ children }: PageLayoutSlotProps) {
  return <Fragment>{children}</Fragment>;
}

function PageLayoutRight({ children }: PageLayoutSlotProps) {
  return <Fragment>{children}</Fragment>;
}

function getColumnLayoutClass(hasLeft: boolean, hasRight: boolean): string {
  if (hasLeft && hasRight) {
    return "grid-cols-[var(--sidebar-width)_minmax(0,1fr)_var(--sidebar-width)] max-[1023.98px]:flex max-[1023.98px]:flex-col";
  }
  if (hasLeft) {
    return "grid-cols-[var(--sidebar-width)_minmax(0,1fr)] max-[1023.98px]:flex max-[1023.98px]:flex-col";
  }
  if (hasRight) {
    return "grid-cols-[minmax(0,1fr)_var(--sidebar-width)] max-[1023.98px]:flex max-[1023.98px]:flex-col";
  }
  return "flex flex-col";
}

function getSidebarClass(side: MobileDrawerSide, variant: PageLayoutVariant): string {
  let className =
    "sticky top-0 min-h-0 h-full max-h-full self-start overflow-y-auto bg-card [overscroll-behavior:contain]";
  if (side === "left") {
    className = `${className} rounded-l-lg border-r border-border`;
  }
  if (side === "right") {
    className = `${className} rounded-r-lg border-l border-border`;
  }
  if (variant === "panel") {
    className = `${className} rounded-lg border border-border bg-card [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`;
  }
  return className;
}

function getContentClass(hasLeft: boolean, hasRight: boolean, variant: PageLayoutVariant): string {
  let className =
    "min-h-0 min-w-0 h-full overflow-y-auto [overscroll-behavior:contain] max-[1023.98px]:flex-1 max-[1023.98px]:h-auto max-[1023.98px]:overflow-y-visible max-[1023.98px]:[overscroll-behavior:auto]";
  if (!hasLeft && !hasRight) {
    className = `${className} flex-1`;
  }
  if (variant === "panel") {
    className = `${className} [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden`;
  }
  return className;
}

function isPageLayoutSlot(
  child: ReactNode,
  slotType: typeof PageLayoutLeft | typeof PageLayoutMiddle | typeof PageLayoutRight,
): child is ReactElement<PageLayoutSlotProps> {
  if (!isValidElement(child)) return false;
  return child.type === slotType;
}

function extractSlotsFromChildren(children: ReactNode): {
  left: ReactNode | undefined;
  middle: ReactNode | undefined;
  right: ReactNode | undefined;
  fallback: ReactNode | undefined;
  hasSlotChildren: boolean;
} {
  let left: ReactNode | undefined;
  let middle: ReactNode | undefined;
  let right: ReactNode | undefined;
  const fallbackParts: ReactNode[] = [];
  let hasSlotChildren = false;

  Children.forEach(children, (child) => {
    if (isPageLayoutSlot(child, PageLayoutLeft)) {
      left = child.props.children;
      hasSlotChildren = true;
      return;
    }
    if (isPageLayoutSlot(child, PageLayoutMiddle)) {
      middle = child.props.children;
      hasSlotChildren = true;
      return;
    }
    if (isPageLayoutSlot(child, PageLayoutRight)) {
      right = child.props.children;
      hasSlotChildren = true;
      return;
    }
    fallbackParts.push(child);
  });

  let fallback: ReactNode | undefined;
  if (fallbackParts.length === 1) {
    fallback = fallbackParts[0];
  }
  if (fallbackParts.length > 1) {
    fallback = <Fragment>{fallbackParts}</Fragment>;
  }

  return { left, middle, right, fallback, hasSlotChildren };
}

function useMobilePageLayoutDrawersState({
  hasLeft,
  hasRight,
}: {
  hasLeft: boolean;
  hasRight: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState<MobileDrawerSide | null>(null);
  const mobileLeftOpen = mobileOpen === "left";
  const mobileRightOpen = mobileOpen === "right";

  const closeMobileDrawer = useCallback(() => {
    setMobileOpen((prev) => {
      if (prev === null) return prev;
      return null;
    });
  }, []);

  const openMobileDrawer = useCallback(
    (side: MobileDrawerSide) => {
      if (side === "left" && !hasLeft) return;
      if (side === "right" && !hasRight) return;
      setMobileOpen((prev) => {
        if (prev === side) return prev;
        return side;
      });
    },
    [hasLeft, hasRight],
  );

  useOnPageLayoutMobileChange((nextIsMobile) => {
    if (nextIsMobile) return;
    closeMobileDrawer();
  });

  return {
    mobileLeftOpen,
    mobileRightOpen,
    closeMobileDrawer,
    openMobileDrawer,
  };
}

function PageLayoutMobileDrawers({
  isPageLayoutMobile,
  hasLeft,
  hasRight,
  labels,
  drawerState,
  resolvedPanels,
}: {
  isPageLayoutMobile: boolean;
  hasLeft: boolean;
  hasRight: boolean;
  labels: {
    left: string;
    right: string;
  };
  drawerState: ReturnType<typeof useMobilePageLayoutDrawersState>;
  resolvedPanels: {
    left: ReactNode;
    right: ReactNode;
  };
}) {
  if (!isPageLayoutMobile) return null;

  const leftLabel = labels.left;
  const rightLabel = labels.right;
  const mobileLeftOpen = drawerState.mobileLeftOpen;
  const mobileRightOpen = drawerState.mobileRightOpen;
  const openMobileDrawer = drawerState.openMobileDrawer;

  return (
    <>
      {(hasLeft || hasRight) && (
        <div className="fixed inset-x-0 bottom-2 z-30 mx-auto flex w-fit items-center gap-2 rounded-full bg-background px-2 py-1.5 shadow-lg backdrop-blur">
          {hasLeft && (
            <Button
              variant="ghost"
              size="sm"
              surface="mobile-toggle"
              active={mobileLeftOpen}
              onClick={() => openMobileDrawer("left")}
            >
              <PanelLeft className="h-3.5 w-3.5" />
              {leftLabel}
            </Button>
          )}
          {hasRight && (
            <Button
              variant="ghost"
              size="sm"
              surface="mobile-toggle"
              active={mobileRightOpen}
              onClick={() => openMobileDrawer("right")}
            >
              <PanelRight className="h-3.5 w-3.5" />
              {rightLabel}
            </Button>
          )}
        </div>
      )}

      {mobileLeftOpen && hasLeft && (
        <aside className="fixed bottom-0 top-0 left-0 z-50 h-dvh max-h-dvh w-[min(94vw,28rem)] max-w-[min(94vw,28rem)] overflow-y-auto rounded-none border border-r border-border bg-background px-3 pb-3 shadow-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {resolvedPanels.left}
        </aside>
      )}

      {mobileRightOpen && hasRight && (
        <aside className="fixed bottom-0 top-0 right-0 z-50 h-dvh max-h-dvh w-[min(94vw,28rem)] max-w-[min(94vw,28rem)] overflow-y-auto rounded-none border border-l border-border bg-background px-3 pb-3 shadow-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {resolvedPanels.right}
        </aside>
      )}
    </>
  );
}

/**
 * Standard page wrapper with optional left and right sidebars.
 *
 * Use slot children for composition:
 * - <PageLayout.Left>
 * - <PageLayout.Middle>
 * - <PageLayout.Right>
 */
function PageLayoutComponent({
  children,
  className,
  variant = "default",
  mobileDrawerOpen,
  mobileDrawerSide = "right",
  mobileDrawerCloseWhenClosed = true,
  mobilePanelLabels,
}: {
  children?: ReactNode;
  className?: string;
  variant?: PageLayoutVariant;
  mobileDrawerOpen?: boolean;
  mobileDrawerSide?: MobileDrawerSide;
  mobileDrawerCloseWhenClosed?: boolean;
  mobilePanelLabels?: MobilePanelLabels;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isPageLayoutMobile = useIsPageLayoutMobile();
  const slots = extractSlotsFromChildren(children);
  const resolvedLeft = slots.left;
  const resolvedRight = slots.right;
  let resolvedMiddle = slots.middle;

  if (resolvedMiddle === undefined) {
    if (slots.hasSlotChildren) {
      resolvedMiddle = slots.fallback;
    } else {
      resolvedMiddle = children;
    }
  }

  const hasLeft = resolvedLeft !== undefined && resolvedLeft !== null;
  const hasRight = resolvedRight !== undefined && resolvedRight !== null;
  const columnClass = getColumnLayoutClass(hasLeft, hasRight);
  const mobileDrawerState = useMobilePageLayoutDrawersState({ hasLeft, hasRight });
  const labels = mobilePanelLabels ?? resolveMobilePanelLabels(pathname);
  let leftLabel = "Left panel";
  let rightLabel = "Right panel";
  if (labels.left) leftLabel = labels.left;
  if (labels.right) rightLabel = labels.right;

  const mobileDrawerControls = useMemo(
    () => ({
      isPageLayoutMobile,
      openMobileDrawer: mobileDrawerState.openMobileDrawer,
      closeMobileDrawer: mobileDrawerState.closeMobileDrawer,
    }),
    [isPageLayoutMobile, mobileDrawerState.closeMobileDrawer, mobileDrawerState.openMobileDrawer],
  );
  const closeMobileDrawer = mobileDrawerState.closeMobileDrawer;
  const openMobileDrawer = mobileDrawerState.openMobileDrawer;

  useEffect(() => {
    if (!isPageLayoutMobile) return;
    if (mobileDrawerOpen === undefined) return;

    if (!mobileDrawerOpen) {
      if (mobileDrawerCloseWhenClosed) {
        closeMobileDrawer();
      }
      return;
    }

    openMobileDrawer(mobileDrawerSide);
  }, [
    closeMobileDrawer,
    isPageLayoutMobile,
    mobileDrawerCloseWhenClosed,
    mobileDrawerOpen,
    mobileDrawerSide,
    openMobileDrawer,
  ]);

  let layoutClass = `mx-auto grid h-full min-h-0 w-full max-w-7xl items-start gap-3 px-3 py-2 sm:gap-6 sm:px-4 sm:py-3 lg:px-6 max-[1023.98px]:h-auto ${columnClass}`;
  if (className) {
    layoutClass = `${layoutClass} ${className}`;
  }

  const contentClass = getContentClass(hasLeft, hasRight, variant);
  const leftSidebarClass = getSidebarClass("left", variant);
  const rightSidebarClass = getSidebarClass("right", variant);

  return (
    <PageLayoutMobileDrawerProvider value={mobileDrawerControls}>
      <div className={layoutClass}>
        <PageLayoutMobileDrawers
          isPageLayoutMobile={isPageLayoutMobile}
          hasLeft={hasLeft}
          hasRight={hasRight}
          labels={{
            left: leftLabel,
            right: rightLabel,
          }}
          drawerState={mobileDrawerState}
          resolvedPanels={{
            left: resolvedLeft,
            right: resolvedRight,
          }}
        />

        {!isPageLayoutMobile && hasLeft && (
          <aside className={leftSidebarClass}>{resolvedLeft}</aside>
        )}
        <main className={contentClass}>{resolvedMiddle}</main>
        {!isPageLayoutMobile && hasRight && (
          <aside className={rightSidebarClass}>{resolvedRight}</aside>
        )}
      </div>
    </PageLayoutMobileDrawerProvider>
  );
}

export const PageLayout = Object.assign(PageLayoutComponent, {
  Left: PageLayoutLeft,
  Middle: PageLayoutMiddle,
  Right: PageLayoutRight,
});

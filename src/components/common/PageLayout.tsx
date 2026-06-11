/* eslint-disable react-refresh/only-export-components */
import {
  Children,
  Fragment,
  useCallback,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import type { ReactNode } from "react";
import { useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/common/Button";
import {
  usePageLayoutMobileState,
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

export const PAGE_LAYOUT_MOBILE_SIZE_CONFIG = {
  stackColumns: "flex flex-col",
  content: "flex-1 h-auto overflow-y-visible [overscroll-behavior:auto]",
  frame: "max-w-none h-auto",
  drawerHeight: "h-dvh max-h-dvh",
  drawerWidth: "w-[80vw] max-w-[80vw]",
} as const;

const PAGE_LAYOUT_WIDTH_CLASS_CONTRACT = {
  threeColumns:
    "grid-cols-[20rem_minmax(0,1fr)_10rem] md:grid-cols-[20rem_minmax(0,1fr)_20rem] lg:grid-cols-[20rem_minmax(0,1fr)_34rem] xl:grid-cols-[20rem_minmax(0,1fr)_40rem]",
  leftColumn: "grid-cols-[20rem_minmax(0,1fr)]",
  rightColumn:
    "grid-cols-[minmax(0,1fr)_10rem] md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_34rem] xl:grid-cols-[minmax(0,1fr)_40rem]",
} as const;

function PageLayoutLeft({ children }: PageLayoutSlotProps) {
  return <Fragment>{children}</Fragment>;
}

function PageLayoutMiddle({ children }: PageLayoutSlotProps) {
  return <Fragment>{children}</Fragment>;
}

function PageLayoutRight({ children }: PageLayoutSlotProps) {
  return <Fragment>{children}</Fragment>;
}

function getColumnLayoutClass(hasLeft: boolean, hasRight: boolean, isPageLayoutMobile: boolean): string {
  if (isPageLayoutMobile) {
    return PAGE_LAYOUT_MOBILE_SIZE_CONFIG.stackColumns;
  }

  const mobileStackClass = isPageLayoutMobile ? ` ${PAGE_LAYOUT_MOBILE_SIZE_CONFIG.stackColumns}` : "";

  if (hasLeft && hasRight) {
    return `${PAGE_LAYOUT_WIDTH_CLASS_CONTRACT.threeColumns}${mobileStackClass}`;
  }
  if (hasLeft) {
    return `${PAGE_LAYOUT_WIDTH_CLASS_CONTRACT.leftColumn}${mobileStackClass}`;
  }
  if (hasRight) {
    return `${PAGE_LAYOUT_WIDTH_CLASS_CONTRACT.rightColumn}${mobileStackClass}`;
  }
  return "flex flex-col";
}

function getSidebarClass(side: MobileDrawerSide, variant: PageLayoutVariant): string {
  let className =
    "sticky top-0 min-h-0 self-start overflow-y-auto bg-card [overscroll-behavior:contain]";
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

function getContentClass(
  hasLeft: boolean,
  hasRight: boolean,
  variant: PageLayoutVariant,
  isPageLayoutMobile: boolean,
): string {
  let className = "min-h-0 min-w-0 [overscroll-behavior:contain]";
  if (isPageLayoutMobile) {
    className = `${className} ${PAGE_LAYOUT_MOBILE_SIZE_CONFIG.content}`;
  } else {
    className = `${className} h-full overflow-y-auto`;
  }
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

function usePageLayoutMobileDrawerScrollLock({
  isPageLayoutMobile,
  mobileDrawerOpen,
}: {
  isPageLayoutMobile: boolean;
  mobileDrawerOpen: boolean;
}) {
  useEffect(() => {
    if (!isPageLayoutMobile || !mobileDrawerOpen) return;

    const body = document.body;
    const root = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior;
    const previousRootOverflow = root.style.overflow;
    const previousRootOverscrollBehavior = root.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.overscrollBehavior = previousBodyOverscrollBehavior;
      root.style.overflow = previousRootOverflow;
      root.style.overscrollBehavior = previousRootOverscrollBehavior;
    };
  }, [isPageLayoutMobile, mobileDrawerOpen]);
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
  const mobileLeftOpen = drawerState.mobileLeftOpen;
  const mobileRightOpen = drawerState.mobileRightOpen;
  const openMobileDrawer = drawerState.openMobileDrawer;
  const closeMobileDrawer = drawerState.closeMobileDrawer;
  const mobileDrawerOpen = mobileLeftOpen || mobileRightOpen;

  useEffect(() => {
    if (!isPageLayoutMobile || !mobileDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // Don't close the drawer if a Radix dialog is currently open
      if (document.querySelector("[data-radix-dialog-content]")) return;
      closeMobileDrawer();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMobileDrawer, isPageLayoutMobile, mobileDrawerOpen]);

  usePageLayoutMobileDrawerScrollLock({ isPageLayoutMobile, mobileDrawerOpen });

  if (!isPageLayoutMobile) return null;

  const leftLabel = labels.left;
  const rightLabel = labels.right;

  return (
    <>
      {mobileDrawerOpen && (
        <button
          type="button"
          aria-label="Dismiss side panel"
          className="fixed inset-0 z-40 bg-black/40"
          onClick={closeMobileDrawer}
        />
      )}

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
        <aside
          className={`fixed bottom-0 top-0 left-0 z-50 ${PAGE_LAYOUT_MOBILE_SIZE_CONFIG.drawerHeight} overflow-y-auto rounded-none border border-r border-border bg-background px-3 pb-3 shadow-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${PAGE_LAYOUT_MOBILE_SIZE_CONFIG.drawerWidth}`}
        >
          {resolvedPanels.left}
        </aside>
      )}

      {mobileRightOpen && hasRight && (
        <aside
          className={`fixed bottom-0 top-0 right-0 z-50 ${PAGE_LAYOUT_MOBILE_SIZE_CONFIG.drawerHeight} overflow-y-auto rounded-none border border-l border-border bg-background pl-3 pr-0 pb-3 shadow-xl [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${PAGE_LAYOUT_MOBILE_SIZE_CONFIG.drawerWidth}`}
        >
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
  mobileDrawerOpen?: boolean | string | number;
  mobileDrawerSide?: MobileDrawerSide;
  mobileDrawerCloseWhenClosed?: boolean;
  mobilePanelLabels?: MobilePanelLabels;
}) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const pageLayoutMobileState = usePageLayoutMobileState();
  const isPageLayoutMobile = pageLayoutMobileState.mode === "mobile";
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
  const columnClass = getColumnLayoutClass(hasLeft, hasRight, isPageLayoutMobile);
  const mobileDrawerState = useMobilePageLayoutDrawersState({ hasLeft, hasRight });
  const labels = mobilePanelLabels ?? resolveMobilePanelLabels(pathname);
  let leftLabel = "Left panel";
  let rightLabel = "Right panel";
  if (labels.left) leftLabel = labels.left;
  if (labels.right) rightLabel = labels.right;

  const mobileDrawerControls = useMemo(
    () => ({
      pageLayoutMode: pageLayoutMobileState.mode,
      openMobileDrawer: mobileDrawerState.openMobileDrawer,
      closeMobileDrawer: mobileDrawerState.closeMobileDrawer,
    }),
    [
      mobileDrawerState.closeMobileDrawer,
      mobileDrawerState.openMobileDrawer,
      pageLayoutMobileState.mode,
    ],
  );
  const closeMobileDrawer = mobileDrawerState.closeMobileDrawer;
  const openMobileDrawer = mobileDrawerState.openMobileDrawer;
  const lastMobileDrawerSyncRef = useRef<{
    isOpen: boolean;
    side: MobileDrawerSide;
  } | null>(null);

  useEffect(() => {
    if (!isPageLayoutMobile) return;
    if (mobileDrawerOpen === undefined) return;

    const previousSync = lastMobileDrawerSyncRef.current;

    if (!mobileDrawerOpen) {
      lastMobileDrawerSyncRef.current = {
        isOpen: false,
        side: mobileDrawerSide,
      };
      if (mobileDrawerCloseWhenClosed) {
        closeMobileDrawer();
      }
      return;
    }

    if (!previousSync?.isOpen || previousSync.side !== mobileDrawerSide) {
      openMobileDrawer(mobileDrawerSide);
    }

    lastMobileDrawerSyncRef.current = {
      isOpen: true,
      side: mobileDrawerSide,
    };
  }, [
    closeMobileDrawer,
    isPageLayoutMobile,
    mobileDrawerCloseWhenClosed,
    mobileDrawerOpen,
    mobileDrawerSide,
    openMobileDrawer,
  ]);

  const mobileFrameClass = isPageLayoutMobile ? ` ${PAGE_LAYOUT_MOBILE_SIZE_CONFIG.frame}` : "";
  let layoutClass = isPageLayoutMobile
    ? `mx-auto flex h-auto min-h-0 w-full flex-col items-stretch gap-3 px-3 py-2 sm:gap-6 sm:px-4 sm:py-3 lg:px-6${mobileFrameClass}`
    : `mx-auto grid h-full min-h-0 w-full max-w-[104rem] items-start gap-3 px-3 py-2 sm:gap-6 sm:px-4 sm:py-3 lg:px-6${mobileFrameClass} ${columnClass}`;
  if (className) {
    layoutClass = `${layoutClass} ${className}`;
  }

  const contentClass = getContentClass(hasLeft, hasRight, variant, isPageLayoutMobile);
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

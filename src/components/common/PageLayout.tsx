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
  PageLayoutContent,
  PageLayoutFrame,
  PageLayoutMobileControls,
  PageLayoutMobileDrawer,
  PageLayoutSidebar,
} from "@/components/common/LayoutPrimitives";
import {
  useIsPageLayoutMobile,
  useOnPageLayoutMobileChange,
} from "@/components/common/usePageLayoutMobile";
import { PanelLeft, PanelRight } from "lucide-react";
import {
  PageLayoutMobileDrawerProvider,
  type MobileDrawerSide,
} from "@/hooks/usePageLayoutMobileDrawer";

type MobilePanelLabelKey = "default" | "graph" | "map" | "notes" | "images" | "todos";

function getMobilePanelLabels(key: MobilePanelLabelKey): {
  left?: string;
  right?: string;
} {
  if (key === "map") {
    return {
      left: "Filters",
      right: "Details",
    };
  }
  if (key === "graph") {
    return {
      left: "Filters",
      right: "Details",
    };
  }
  if (key === "notes") {
    return {
      left: "Filters",
      right: "Preview",
    };
  }
  if (key === "images") {
    return {
      left: "Library",
      right: "Details",
    };
  }
  if (key === "todos") {
    return {
      left: "Filters",
    };
  }
  return {
    left: "Left panel",
    right: "Right panel",
  };
}

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

function getColumnLayoutClass(
  hasLeft: boolean,
  hasRight: boolean,
  isPageLayoutMobile: boolean,
): string {
  if (isPageLayoutMobile) return "ui-layout-single-scroll";
  if (hasLeft && hasRight) return "ui-layout-cols-3";
  if (hasLeft) return "ui-layout-cols-2-left";
  if (hasRight) return "ui-layout-cols-2-right";
  return "ui-layout-single-scroll";
}

function getVariantClass(variant: PageLayoutVariant): string {
  if (variant === "panel") return "ui-layout-variant-panel";
  return "";
}

function resolveMobileLabelKeyFromPathname(pathname: string): MobilePanelLabelKey {
  if (pathname.includes("/section/map")) return "map";
  if (pathname.includes("/section/graph")) return "graph";
  if (pathname.includes("/section/notes")) return "notes";
  if (pathname.includes("/section/images")) return "images";
  if (pathname.includes("/section/todos")) return "todos";
  return "default";
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

  useEffect(() => {
    if (!mobileLeftOpen && !mobileRightOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileLeftOpen, mobileRightOpen]);

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
        <PageLayoutMobileControls>
          {hasLeft && (
            <Button
              variant="ghost"
              size="sm"
              surface="mobile-toggle"
              active={mobileLeftOpen}
              onClick={() => openMobileDrawer("left")}
            >
              <PanelLeft className="icon-sm" />
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
              <PanelRight className="icon-sm" />
              {rightLabel}
            </Button>
          )}
        </PageLayoutMobileControls>
      )}

      {mobileLeftOpen && hasLeft && (
        <PageLayoutMobileDrawer side="left">{resolvedPanels.left}</PageLayoutMobileDrawer>
      )}

      {mobileRightOpen && hasRight && (
        <PageLayoutMobileDrawer side="right">{resolvedPanels.right}</PageLayoutMobileDrawer>
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
}: {
  children?: ReactNode;
  className?: string;
  variant?: PageLayoutVariant;
  mobileDrawerOpen?: boolean;
  mobileDrawerSide?: MobileDrawerSide;
  mobileDrawerCloseWhenClosed?: boolean;
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
  const columnClass = getColumnLayoutClass(hasLeft, hasRight, isPageLayoutMobile);
  const mobileDrawerState = useMobilePageLayoutDrawersState({ hasLeft, hasRight });
  const mobileLabelKey = resolveMobileLabelKeyFromPathname(pathname);

  const labels = getMobilePanelLabels(mobileLabelKey);
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

  let layoutClass = `ui-layout-frame ${columnClass}`;
  const variantClass = getVariantClass(variant);
  if (variantClass) {
    layoutClass = `${layoutClass} ${variantClass}`;
  }
  if (className) {
    layoutClass = `${layoutClass} ${className}`;
  }
  layoutClass = `${layoutClass} ${isPageLayoutMobile ? "ui-layout-mode-mobile" : "ui-layout-mode-desktop"}`;

  return (
    <PageLayoutMobileDrawerProvider value={mobileDrawerControls}>
      <PageLayoutFrame className={layoutClass}>
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
          <PageLayoutSidebar side="left">{resolvedLeft}</PageLayoutSidebar>
        )}
        <PageLayoutContent>{resolvedMiddle}</PageLayoutContent>
        {!isPageLayoutMobile && hasRight && (
          <PageLayoutSidebar side="right">{resolvedRight}</PageLayoutSidebar>
        )}
      </PageLayoutFrame>
    </PageLayoutMobileDrawerProvider>
  );
}

export const PageLayout = Object.assign(PageLayoutComponent, {
  Left: PageLayoutLeft,
  Middle: PageLayoutMiddle,
  Right: PageLayoutRight,
});

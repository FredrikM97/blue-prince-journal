import {
  Children,
  Fragment,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
} from "react";
import type { ReactNode, WheelEvent } from "react";
import { GhostButton } from "@/components/common/Button";
import { PanelLeft, PanelRight, X } from "lucide-react";
import {
  PageLayoutMobileDrawerProvider,
  type MobileDrawerSide,
} from "@/components/common/PageLayoutMobileDrawerContext";

type MobilePanelLabelKey = "default" | "map" | "notes" | "images" | "todos";

type MobilePanelA11yText = {
  closeSidePanel: string;
  closeLeftPanel: string;
  closeRightPanel: string;
};

function getMobilePanelA11yText(): MobilePanelA11yText {
  return {
    closeSidePanel: "Close side panel",
    closeLeftPanel: "Close left panel",
    closeRightPanel: "Close right panel",
  };
}

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
  if (hasLeft && hasRight) return "page-layout-three-column";
  if (hasLeft) return "page-layout-two-column-left";
  if (hasRight) return "page-layout-two-column-right";
  return "page-layout-single-column-scroll";
}

function resolveMobileLabelKeyFromPathname(pathname: string): MobilePanelLabelKey {
  if (pathname.includes("/section/map")) return "map";
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

  function closeMobileDrawer() {
    setMobileOpen(null);
  }

  function openMobileDrawer(side: MobileDrawerSide) {
    if (side === "left" && !hasLeft) return;
    if (side === "right" && !hasRight) return;
    setMobileOpen(side);
  }

  useEffect(() => {
    if (!mobileLeftOpen && !mobileRightOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileLeftOpen, mobileRightOpen]);

  useEffect(() => {
    function onResize() {
      if (window.innerWidth < 1024) return;
      closeMobileDrawer();
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return {
    mobileLeftOpen,
    mobileRightOpen,
    closeMobileDrawer,
    openMobileDrawer,
  };
}

function PageLayoutMobileDrawers({
  hasLeft,
  hasRight,
  labels,
  a11yText,
  drawerState,
  resolvedPanels,
}: {
  hasLeft: boolean;
  hasRight: boolean;
  labels: {
    left: string;
    right: string;
  };
  a11yText: MobilePanelA11yText;
  drawerState: ReturnType<typeof useMobilePageLayoutDrawersState>;
  resolvedPanels: {
    left: ReactNode;
    right: ReactNode;
  };
}) {
  const leftLabel = labels.left;
  const rightLabel = labels.right;
  const mobileLeftOpen = drawerState.mobileLeftOpen;
  const mobileRightOpen = drawerState.mobileRightOpen;
  const closeMobileDrawer = drawerState.closeMobileDrawer;
  const openMobileDrawer = drawerState.openMobileDrawer;

  return (
    <>
      {(hasLeft || hasRight) && (
        <div className="page-layout-mobile-controls lg:hidden">
          {hasLeft && (
            <GhostButton
              size="sm"
              onClick={() => openMobileDrawer("left")}
              className="page-layout-mobile-toggle"
            >
              <PanelLeft className="icon-sm" />
              {leftLabel}
            </GhostButton>
          )}
          {hasRight && (
            <GhostButton
              size="sm"
              onClick={() => openMobileDrawer("right")}
              className="page-layout-mobile-toggle"
            >
              <PanelRight className="icon-sm" />
              {rightLabel}
            </GhostButton>
          )}
        </div>
      )}

      {(mobileLeftOpen || mobileRightOpen) && (
        <button
          type="button"
          aria-label={a11yText.closeSidePanel}
          className="page-layout-mobile-backdrop lg:hidden"
          onClick={closeMobileDrawer}
        />
      )}

      {mobileLeftOpen && hasLeft && (
        <aside className="page-layout-mobile-drawer page-layout-mobile-drawer-left lg:hidden">
          <div className="page-layout-mobile-drawer-header">
            <span className="section-label">{leftLabel}</span>
            <GhostButton
              size="icon"
              onClick={closeMobileDrawer}
              aria-label={a11yText.closeLeftPanel}
            >
              <X className="icon-sm" />
            </GhostButton>
          </div>
          <div className="page-layout-mobile-drawer-body">{resolvedPanels.left}</div>
        </aside>
      )}

      {mobileRightOpen && hasRight && (
        <aside className="page-layout-mobile-drawer page-layout-mobile-drawer-right lg:hidden">
          <div className="page-layout-mobile-drawer-header">
            <span className="section-label">{rightLabel}</span>
            <GhostButton
              size="icon"
              onClick={closeMobileDrawer}
              aria-label={a11yText.closeRightPanel}
            >
              <X className="icon-sm" />
            </GhostButton>
          </div>
          <div className="page-layout-mobile-drawer-body">{resolvedPanels.right}</div>
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
  prioritizeMiddleScroll,
}: {
  children?: ReactNode;
  className?: string;
  prioritizeMiddleScroll?: boolean;
}) {
  const middleRef = useRef<HTMLElement | null>(null);

  function forwardWheelToMiddle(event: WheelEvent<HTMLElement>) {
    if (!prioritizeMiddleScroll) return;
    if (event.deltaY === 0) return;
    const middleEl = middleRef.current;
    if (!middleEl) return;
    if (event.cancelable) {
      event.preventDefault();
    }
    middleEl.scrollTop += event.deltaY;
  }

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
  let mobileLabelKey: MobilePanelLabelKey = "default";
  if (typeof window !== "undefined") {
    mobileLabelKey = resolveMobileLabelKeyFromPathname(window.location.pathname);
  }

  const labels = getMobilePanelLabels(mobileLabelKey);
  const a11yText = getMobilePanelA11yText();
  let leftLabel = "Left panel";
  let rightLabel = "Right panel";
  if (labels.left) leftLabel = labels.left;
  if (labels.right) rightLabel = labels.right;

  const mobileDrawerControls = useMemo(
    () => ({
      openMobileDrawer: mobileDrawerState.openMobileDrawer,
      closeMobileDrawer: mobileDrawerState.closeMobileDrawer,
    }),
    [mobileDrawerState.closeMobileDrawer, mobileDrawerState.openMobileDrawer],
  );

  let layoutClass = `page-layout ${columnClass}`;
  if (prioritizeMiddleScroll) {
    layoutClass = `${layoutClass} page-layout-middle-scroll-priority`;
  }
  if (className) {
    layoutClass = `${layoutClass} ${className}`;
  }

  return (
    <PageLayoutMobileDrawerProvider value={mobileDrawerControls}>
      <div className={layoutClass}>
        <PageLayoutMobileDrawers
          hasLeft={hasLeft}
          hasRight={hasRight}
          labels={{
            left: leftLabel,
            right: rightLabel,
          }}
          a11yText={a11yText}
          drawerState={mobileDrawerState}
          resolvedPanels={{
            left: resolvedLeft,
            right: resolvedRight,
          }}
        />

        {hasLeft && (
          <aside
            className="page-layout-sidebar page-layout-sidebar-desktop"
            onWheel={forwardWheelToMiddle}
          >
            {resolvedLeft}
          </aside>
        )}
        <main ref={middleRef} className="page-layout-content">
          {resolvedMiddle}
        </main>
        {hasRight && (
          <aside
            className="page-layout-rightbar page-layout-rightbar-desktop"
            onWheel={forwardWheelToMiddle}
          >
            {resolvedRight}
          </aside>
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

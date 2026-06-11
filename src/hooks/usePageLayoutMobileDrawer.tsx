import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
import type { PageLayoutMode } from "@/hooks/usePageLayoutMobile";

export type MobileDrawerSide = "left" | "right";

export type MobileDrawerControls = {
  pageLayoutMode: PageLayoutMode;
  openMobileDrawer: (side: MobileDrawerSide) => void;
  closeMobileDrawer: () => void;
};

const PageLayoutMobileDrawerContext = createContext<MobileDrawerControls | null>(null);

export function PageLayoutMobileDrawerProvider({
  value,
  children,
}: {
  value: MobileDrawerControls;
  children: ReactNode;
}) {
  return (
    <PageLayoutMobileDrawerContext.Provider value={value}>
      {children}
    </PageLayoutMobileDrawerContext.Provider>
  );
}

export function usePageLayoutMobileDrawerControls() {
  return useContext(PageLayoutMobileDrawerContext);
}

export function useSyncPageLayoutMobileDrawer({
  isOpen,
  side = "right",
  closeWhenClosed = true,
}: {
  isOpen: boolean;
  side?: MobileDrawerSide;
  closeWhenClosed?: boolean;
}) {
  const drawerControls = usePageLayoutMobileDrawerControls();

  useEffect(() => {
    if (drawerControls?.pageLayoutMode !== "mobile") return;
    if (!isOpen) {
      if (closeWhenClosed) {
        drawerControls.closeMobileDrawer();
      }
      return;
    }
    drawerControls.openMobileDrawer(side);
  }, [closeWhenClosed, drawerControls, isOpen, side]);
}

export function useSyncPageLayoutMobileRightDrawer(isOpen: boolean) {
  useSyncPageLayoutMobileDrawer({ isOpen, side: "right" });
}

export function usePageLayoutMobileDrawerProps({
  mobileDrawerOpen,
  mobileDrawerSide = "right",
}: {
  mobileDrawerOpen: boolean | string | number;
  mobileDrawerSide?: MobileDrawerSide;
}) {
  return useMemo(
    () => ({
      mobileDrawerOpen,
      mobileDrawerSide,
    }),
    [mobileDrawerOpen, mobileDrawerSide],
  );
}

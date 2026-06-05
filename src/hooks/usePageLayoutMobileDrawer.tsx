import { createContext, useContext, useEffect, type ReactNode } from "react";

export type MobileDrawerSide = "left" | "right";

export type MobileDrawerControls = {
  isPageLayoutMobile: boolean;
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
    if (!drawerControls?.isPageLayoutMobile) return;
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

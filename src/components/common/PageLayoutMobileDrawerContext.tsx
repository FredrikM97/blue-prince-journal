/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, type ReactNode } from "react";

export type MobileDrawerSide = "left" | "right";

export type MobileDrawerControls = {
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

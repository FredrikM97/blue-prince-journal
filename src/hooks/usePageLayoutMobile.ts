import { useEffect, useMemo } from "react";
import {
  getViewportWidth,
  subscribeToMediaQuery,
  useMediaQuery,
} from "@/hooks/useMediaQuery";

// Keep this in sync with the page-layout desktop/mobile media queries in PageLayout.
export const PAGE_LAYOUT_MOBILE_BREAKPOINT = 1400;
export const PAGE_LAYOUT_MOBILE_MAX_WIDTH = PAGE_LAYOUT_MOBILE_BREAKPOINT - 0.02;
export const PAGE_LAYOUT_MOBILE_MEDIA_QUERY = `(max-width: ${PAGE_LAYOUT_MOBILE_MAX_WIDTH}px)`;
export const PAGE_LAYOUT_MOBILE_MAX_CLASS_FRAGMENT = "max-[1399.98px]";
export const PAGE_LAYOUT_DESKTOP_MIN_CLASS_FRAGMENT = "min-[1400px]";

export type PageLayoutMode = "mobile" | "desktop";

export function getPageLayoutModeClassFragments() {
  return {
    max: PAGE_LAYOUT_MOBILE_MAX_CLASS_FRAGMENT,
    min: PAGE_LAYOUT_DESKTOP_MIN_CLASS_FRAGMENT,
  } as const;
}

export function getPageLayoutResponsiveClassNames({
  mobile,
  desktop,
}: {
  mobile: string;
  desktop: string;
}) {
  const { max, min } = getPageLayoutModeClassFragments();
  return `${max}:${mobile} ${min}:${desktop}`;
}

export function getPageLayoutMinMaxMediaQuery(minWidth: number, maxWidth: number) {
  return `(min-width: ${minWidth}px) and (max-width: ${maxWidth}px)`;
}

export function isPageLayoutMobileWidth(width: number) {
  return width <= PAGE_LAYOUT_MOBILE_MAX_WIDTH;
}

export function getAppFrameShellClass(isPageLayoutMobile: boolean) {
  const responsiveOverflow = getPageLayoutResponsiveClassNames({
    mobile: "overflow-auto",
    desktop: "overflow-hidden",
  });
  return [
    "flex h-dvh w-full flex-col",
    isPageLayoutMobile ? "overflow-auto" : "overflow-hidden",
    responsiveOverflow,
    "bg-background text-foreground",
  ].join(" ");
}

export function useIsPageLayoutMobile() {
  return useMediaQuery(PAGE_LAYOUT_MOBILE_MEDIA_QUERY, isPageLayoutMobileWidth(getViewportWidth()));
}

export function usePageLayoutMobileState() {
  const isPageLayoutMobile = useIsPageLayoutMobile();

  return useMemo(
    () => ({
      mode: (isPageLayoutMobile ? "mobile" : "desktop") as PageLayoutMode,
      isPageLayoutMobile,
    }),
    [isPageLayoutMobile],
  );
}

export function useOnPageLayoutMobileChange(onChange: (isMobile: boolean) => void) {
  useEffect(() => subscribeToMediaQuery(PAGE_LAYOUT_MOBILE_MEDIA_QUERY, onChange), [onChange]);
}

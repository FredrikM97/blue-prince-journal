import { useEffect } from "react";
import {
  getViewportWidth,
  subscribeToMediaQuery,
  useMediaQuery,
} from "@/hooks/useMediaQuery";

// Keep this in sync with the page-layout desktop/mobile media queries in PageLayout.
export const PAGE_LAYOUT_MOBILE_BREAKPOINT = 1024;
export const PAGE_LAYOUT_MOBILE_MAX_WIDTH = PAGE_LAYOUT_MOBILE_BREAKPOINT - 0.02;
export const PAGE_LAYOUT_MOBILE_MEDIA_QUERY = `(max-width: ${PAGE_LAYOUT_MOBILE_MAX_WIDTH}px)`;

export function isPageLayoutMobileWidth(width: number) {
  return width <= PAGE_LAYOUT_MOBILE_MAX_WIDTH;
}

export function useIsPageLayoutMobile() {
  return useMediaQuery(PAGE_LAYOUT_MOBILE_MEDIA_QUERY, isPageLayoutMobileWidth(getViewportWidth()));
}

export function useOnPageLayoutMobileChange(onChange: (isMobile: boolean) => void) {
  useEffect(() => subscribeToMediaQuery(PAGE_LAYOUT_MOBILE_MEDIA_QUERY, onChange), [onChange]);
}

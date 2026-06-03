import { useEffect } from "react";
import {
  getViewportWidth,
  subscribeToMediaQuery,
  useMediaQuery,
} from "@/components/common/useMediaQuery";

// Keep this in sync with the page-layout desktop/mobile media queries in layout.css.
export const PAGE_LAYOUT_MOBILE_BREAKPOINT = 1152;
export const PAGE_LAYOUT_MOBILE_MEDIA_QUERY = `(max-width: ${PAGE_LAYOUT_MOBILE_BREAKPOINT - 0.02}px)`;

export function isPageLayoutMobileWidth(width: number) {
  return width < PAGE_LAYOUT_MOBILE_BREAKPOINT;
}

export function useIsPageLayoutMobile() {
  return useMediaQuery(PAGE_LAYOUT_MOBILE_MEDIA_QUERY, isPageLayoutMobileWidth(getViewportWidth()));
}

export function useOnPageLayoutMobileChange(onChange: (isMobile: boolean) => void) {
  useEffect(() => subscribeToMediaQuery(PAGE_LAYOUT_MOBILE_MEDIA_QUERY, onChange), [onChange]);
}

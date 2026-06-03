import { useEffect, useState } from "react";

export function matchesMediaQuery(query: string, fallback = false) {
  if (typeof window === "undefined") return fallback;
  return window.matchMedia(query).matches;
}

export function subscribeToMediaQuery(query: string, onChange: (matches: boolean) => void) {
  if (typeof window === "undefined") return () => undefined;

  const mediaQuery = window.matchMedia(query);

  function updateMatches() {
    onChange(mediaQuery.matches);
  }

  updateMatches();
  mediaQuery.addEventListener("change", updateMatches);
  return () => mediaQuery.removeEventListener("change", updateMatches);
}

export function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(() => matchesMediaQuery(query, fallback));

  useEffect(() => subscribeToMediaQuery(query, setMatches), [query]);

  return matches;
}

export function getViewportWidth() {
  if (typeof window === "undefined") return 0;
  return window.innerWidth;
}

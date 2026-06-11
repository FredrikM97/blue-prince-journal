import { useEffect, useState } from "react";

export function useProgressiveVisibleCount({
  total,
  enabled,
  initial = 48,
  step = 48,
}: {
  total: number;
  enabled: boolean;
  initial?: number;
  step?: number;
}) {
  const [visibleCount, setVisibleCount] = useState(() => {
    if (!enabled) return total;
    return Math.min(total, initial);
  });

  useEffect(() => {
    if (!enabled) {
      setVisibleCount(total);
      return;
    }
    setVisibleCount(Math.min(total, initial));
  }, [enabled, initial, total]);

  useEffect(() => {
    if (!enabled) return;
    if (visibleCount >= total) return;

    let cancelled = false;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      if (cancelled) return;
      setVisibleCount((current) => Math.min(total, current + step));
    };

    const hasIdleCallback =
      typeof window !== "undefined" &&
      typeof (window as Window & typeof globalThis & { requestIdleCallback?: unknown }).requestIdleCallback === "function";

    if (hasIdleCallback) {
      idleId = (window as Window & typeof globalThis & {
        requestIdleCallback: (cb: IdleRequestCallback, opts?: IdleRequestOptions) => number;
      }).requestIdleCallback(
        () => {
          scheduleNext();
        },
        { timeout: 80 },
      );
    } else {
      timeoutId = setTimeout(scheduleNext, 16);
    }

    return () => {
      cancelled = true;
      if (
        idleId !== null &&
        typeof window !== "undefined" &&
        typeof (window as Window & typeof globalThis & { cancelIdleCallback?: unknown }).cancelIdleCallback === "function"
      ) {
        (window as Window & typeof globalThis & {
          cancelIdleCallback: (id: number) => void;
        }).cancelIdleCallback(idleId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };
  }, [enabled, step, total, visibleCount]);

  return Math.min(total, visibleCount);
}
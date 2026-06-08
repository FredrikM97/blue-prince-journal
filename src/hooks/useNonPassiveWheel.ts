import { useEffect, useRef, type RefObject } from "react";

type WheelEventLike = Pick<WheelEvent, "clientX" | "clientY" | "ctrlKey" | "deltaY" | "deltaMode">;

type NonPassiveWheelOptions = {
  coalesceToAnimationFrame?: boolean;
  preventDefault?: boolean;
};

type WheelStepOptions = {
  invert?: boolean;
  clampAbs?: number;
  epsilon?: number;
};

type ZoomPanInput = {
  currentZoom: number;
  minZoom: number;
  maxZoom: number;
  pan: { x: number; y: number };
  focus: { x: number; y: number };
  wheelDelta: number;
  wheelFactor: number;
  epsilon?: number;
};

export type WheelZoomEventSummary = {
  delta: number;
  focus: { x: number; y: number };
  isPinch: boolean;
};

export function normalizeWheelDelta(event: Pick<WheelEvent, "deltaY" | "deltaMode">): number {
  if (event.deltaMode === 0) return event.deltaY / 120;
  return event.deltaY;
}

export function getWheelStepDelta(
  events: Array<Pick<WheelEvent, "deltaY" | "deltaMode">>,
  options?: WheelStepOptions,
): number {
  const invert = options?.invert ?? false;
  const clampAbs = options?.clampAbs ?? 4;
  const epsilon = options?.epsilon ?? 0;

  let delta = 0;
  for (const event of events) {
    if (event.deltaY === 0) continue;
    const normalized = normalizeWheelDelta(event);
    delta += invert ? -normalized : normalized;
  }

  const clamped = Math.max(-clampAbs, Math.min(clampAbs, delta));
  if (Math.abs(clamped) < epsilon) return 0;
  return clamped;
}

export function summarizeWheelZoomEvents(
  events: WheelEventLike[],
  resolveFocus: (event: WheelEventLike) => { x: number; y: number },
  options?: {
    perEventClampAbs?: number;
    totalClampAbs?: number;
    epsilon?: number;
  },
): WheelZoomEventSummary | null {
  const perEventClampAbs = options?.perEventClampAbs ?? 2;
  const totalClampAbs = options?.totalClampAbs ?? 4;
  const epsilon = options?.epsilon ?? 0.0005;

  let delta = 0;
  let focus = { x: 0, y: 0 };
  let isPinch = false;
  let hasInput = false;

  for (const event of events) {
    const rawDelta = event.ctrlKey ? event.deltaY : normalizeWheelDelta(event);
    const clamped = Math.max(-perEventClampAbs, Math.min(perEventClampAbs, rawDelta));
    delta += clamped;
    focus = resolveFocus(event);
    isPinch = event.ctrlKey;
    hasInput = true;
  }

  if (!hasInput) return null;

  const total = Math.max(-totalClampAbs, Math.min(totalClampAbs, delta));
  if (Math.abs(total) < epsilon) return null;
  return { delta: total, focus, isPinch };
}

export function computeZoomPanFromWheelDelta(input: ZoomPanInput) {
  const {
    currentZoom,
    minZoom,
    maxZoom,
    pan,
    focus,
    wheelDelta,
    wheelFactor,
    epsilon = 0.0005,
  } = input;

  const factor = Math.exp(-wheelDelta * wheelFactor);
  const nextZoom = Math.min(maxZoom, Math.max(minZoom, currentZoom * factor));
  if (Math.abs(nextZoom - currentZoom) < epsilon) {
    return { nextZoom: currentZoom, nextPan: pan, changed: false };
  }

  const nextPan = {
    x: focus.x - ((focus.x - pan.x) / currentZoom) * nextZoom,
    y: focus.y - ((focus.y - pan.y) / currentZoom) * nextZoom,
  };

  return { nextZoom, nextPan, changed: true };
}

export function useNonPassiveWheel<T extends Element>(
  targetRef: RefObject<T | null>,
  onWheel: (events: WheelEventLike[]) => void,
  options?: NonPassiveWheelOptions,
) {
  const queueRef = useRef<WheelEventLike[]>([]);
  const frameRef = useRef<number | null>(null);
  const onWheelRef = useRef(onWheel);

  useEffect(() => {
    onWheelRef.current = onWheel;
  }, [onWheel]);

  const coalesceToAnimationFrame = options?.coalesceToAnimationFrame ?? false;
  const preventDefault = options?.preventDefault ?? false;

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    function snapshot(event: WheelEvent): WheelEventLike {
      return {
        clientX: event.clientX,
        clientY: event.clientY,
        ctrlKey: event.ctrlKey,
        deltaY: event.deltaY,
        deltaMode: event.deltaMode,
      };
    }

    const listener: EventListener = (event) => {
      const wheelEvent = event as WheelEvent;
      if (preventDefault) wheelEvent.preventDefault();

      if (!coalesceToAnimationFrame) {
        onWheelRef.current([snapshot(wheelEvent)]);
        return;
      }

      queueRef.current.push(snapshot(wheelEvent));
      if (frameRef.current !== null) return;

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;
        const batch = queueRef.current;
        queueRef.current = [];
        if (batch.length === 0) return;
        onWheelRef.current(batch);
      });
    };

    target.addEventListener("wheel", listener, { passive: false });
    return () => {
      target.removeEventListener("wheel", listener);
    };
  }, [targetRef, coalesceToAnimationFrame, preventDefault]);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
      queueRef.current = [];
    },
    [],
  );
}

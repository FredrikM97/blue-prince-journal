import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ChevronLeft, ChevronRight, HelpCircle, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/common/menu/DropdownMenu";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { StoredImageView } from "@/components/common/StoredImageView";
import { Text } from "@/components/common/Typography";
import { getWheelStepDelta, useNonPassiveWheel } from "@/hooks/useNonPassiveWheel";

type Point = { x: number; y: number };

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function ImageZoomDialogContent({
  imageId,
  alt,
  onPreviousImage,
  onNextImage,
}: {
  imageId: string;
  alt: string;
  onPreviousImage?: () => void;
  onNextImage?: () => void;
}) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const dragRef = useRef<Point | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const zoomRef = useRef(zoom);

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  const clampOffset = useCallback((next: Point, activeZoom: number): Point => {
    if (activeZoom <= 1) return { x: 0, y: 0 };

    const stage = stageRef.current;
    if (!stage) return next;

    const rect = stage.getBoundingClientRect();
    const maxX = ((activeZoom - 1) * rect.width) / 2;
    const maxY = ((activeZoom - 1) * rect.height) / 2;

    const clampedX = Math.min(maxX, Math.max(-maxX, next.x));
    const clampedY = Math.min(maxY, Math.max(-maxY, next.y));
    return { x: clampedX, y: clampedY };
  }, []);

  const applyZoom = useCallback(
    (nextZoom: number) => {
      const clampedZoom = clampZoom(nextZoom);
      setZoom(clampedZoom);
      setOffset((prev) => {
        if (clampedZoom <= 1) return { x: 0, y: 0 };
        return clampOffset(prev, clampedZoom);
      });
    },
    [clampOffset],
  );

  const resetView = useCallback(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    dragRef.current = null;
    pinchRef.current = null;
    pointersRef.current.clear();
    setDragging(false);
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });

      const pointerValues = Array.from(pointersRef.current.values());
      if (pointerValues.length === 2) {
        const first = pointerValues[0];
        const second = pointerValues[1];
        const distance = Math.hypot(second.x - first.x, second.y - first.y);
        pinchRef.current = { distance, zoom };
        dragRef.current = null;
        setDragging(false);
        return;
      }

      if (pointerValues.length === 1 && zoom > 1) {
        dragRef.current = { x: event.clientX, y: event.clientY };
        setDragging(true);
      }
    },
    [zoom],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!pointersRef.current.has(event.pointerId)) return;

      pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
      const pointerValues = Array.from(pointersRef.current.values());

      if (pointerValues.length === 2) {
        const first = pointerValues[0];
        const second = pointerValues[1];
        const distance = Math.hypot(second.x - first.x, second.y - first.y);
        const pinchState = pinchRef.current;
        if (!pinchState || pinchState.distance <= 0) {
          pinchRef.current = { distance, zoom };
          return;
        }

        const scaleRatio = distance / pinchState.distance;
        applyZoom(pinchState.zoom * scaleRatio);
        return;
      }

      if (pointerValues.length !== 1 || zoom <= 1) return;
      const dragState = dragRef.current;
      if (!dragState) return;

      const deltaX = event.clientX - dragState.x;
      const deltaY = event.clientY - dragState.y;
      dragRef.current = { x: event.clientX, y: event.clientY };

      setOffset((prev) => clampOffset({ x: prev.x + deltaX, y: prev.y + deltaY }, zoom));
    },
    [applyZoom, clampOffset, zoom],
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      pointersRef.current.delete(event.pointerId);
      const remaining = Array.from(pointersRef.current.values());

      if (remaining.length < 2) {
        pinchRef.current = null;
      }

      if (remaining.length === 1 && zoom > 1) {
        const point = remaining[0];
        dragRef.current = { x: point.x, y: point.y };
        setDragging(true);
        return;
      }

      dragRef.current = null;
      setDragging(false);
    },
    [zoom],
  );

  useNonPassiveWheel(
    stageRef,
    (events) => {
      const stepDelta = getWheelStepDelta(events, { invert: true, clampAbs: 4, epsilon: 0.01 });
      if (stepDelta === 0) return;
      applyZoom(zoomRef.current + stepDelta * ZOOM_STEP);
    },
    {
      coalesceToAnimationFrame: true,
      preventDefault: true,
    },
  );

  const onDoubleClick = useCallback(() => {
    if (zoom > 1) {
      resetView();
      return;
    }
    applyZoom(2);
  }, [applyZoom, resetView, zoom]);

  const zoomPercent = Math.round(zoom * 100);

  let cursorClass = "cursor-zoom-in";
  if (zoom > 1) {
    cursorClass = "cursor-grab";
  }
  if (dragging) {
    cursorClass = "cursor-grabbing";
  }

  return (
    <Stack className="flex w-full min-h-0 flex-1 flex-col gap-2" gap="0">
      <Stack className="px-1 py-0.5" gap="0">
        <Inline gap="2" align="center" justify="between">
          <Inline gap="1" align="center">
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Zoom out"
              onClick={() => applyZoom(zoom - ZOOM_STEP)}
              disabled={zoom <= MIN_ZOOM}
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Zoom in"
              onClick={() => applyZoom(zoom + ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label="Zoom controls help">
                  <HelpCircle className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="max-w-xs space-y-1 p-2">
                <Text as="p" size="xs" tone="muted">
                  Mouse: wheel to zoom, drag while zoomed.
                </Text>
                <Text as="p" size="xs" tone="muted">
                  Touch: pinch and drag. Double-click to toggle.
                </Text>
              </DropdownMenuContent>
            </DropdownMenu>
            {onPreviousImage && onNextImage && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Previous image"
                  title="Previous image"
                  onClick={onPreviousImage}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Next image"
                  title="Next image"
                  onClick={onNextImage}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </Inline>
          <Text as="span" size="xs" tone="muted">
            {zoomPercent}%
          </Text>
        </Inline>
      </Stack>

      <div
        className={`relative flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden rounded-md border border-border/40 bg-background [touch-action:none] ${cursorClass}`}
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
      >
        <div
          className="transition-transform duration-100 ease-out [will-change:transform]"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
        >
          <StoredImageView
            id={imageId}
            alt={alt}
            className="h-auto max-h-full w-auto max-w-full select-none object-contain [-webkit-user-drag:none]"
          />
        </div>
      </div>
    </Stack>
  );
}

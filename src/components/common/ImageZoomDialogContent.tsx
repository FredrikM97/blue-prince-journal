import { useCallback, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import { HelpCircle, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/common/dropdown/DropdownMenu";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { StoredImageView } from "@/components/common/StoredImageView";
import { Text } from "@/components/common/Typography";

type Point = { x: number; y: number };

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

function clampZoom(value: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));
}

export function ImageZoomDialogContent({ imageId, alt }: { imageId: string; alt: string }) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef(new Map<number, Point>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const dragRef = useRef<Point | null>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

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

  const onWheel = useCallback(
    (event: ReactWheelEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (event.deltaY === 0) return;
      if (event.deltaY < 0) {
        applyZoom(zoom + ZOOM_STEP);
        return;
      }
      applyZoom(zoom - ZOOM_STEP);
    },
    [applyZoom, zoom],
  );

  const onDoubleClick = useCallback(() => {
    if (zoom > 1) {
      resetView();
      return;
    }
    applyZoom(2);
  }, [applyZoom, resetView, zoom]);

  const zoomPercent = Math.round(zoom * 100);

  let cursorClass = "image-zoom-stage-can-zoom";
  if (zoom > 1) {
    cursorClass = "image-zoom-stage-can-pan";
  }
  if (dragging) {
    cursorClass = "image-zoom-stage-panning";
  }

  return (
    <Stack gap="2" className="image-zoom-dialog-shell">
      <Stack as="div" gap="0" className="image-zoom-toolbar">
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
              <ZoomOut className="icon-sm" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              aria-label="Zoom in"
              onClick={() => applyZoom(zoom + ZOOM_STEP)}
              disabled={zoom >= MAX_ZOOM}
            >
              <ZoomIn className="icon-sm" />
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="icon-sm" />
              Reset
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label="Zoom controls help">
                  <HelpCircle className="icon-sm" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="image-zoom-help-menu">
                <Text as="p" size="xs" tone="muted">
                  Mouse: wheel to zoom, drag while zoomed.
                </Text>
                <Text as="p" size="xs" tone="muted">
                  Touch: pinch and drag. Double-click to toggle.
                </Text>
              </DropdownMenuContent>
            </DropdownMenu>
          </Inline>
          <Text as="span" size="xs" tone="muted">
            {zoomPercent}%
          </Text>
        </Inline>
      </Stack>

      <div
        className={`image-zoom-stage ${cursorClass}`}
        ref={stageRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
      >
        <div
          className="image-zoom-stage-transform"
          style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}
        >
          <StoredImageView id={imageId} alt={alt} className="image-zoom-stage-image" />
        </div>
      </div>
    </Stack>
  );
}

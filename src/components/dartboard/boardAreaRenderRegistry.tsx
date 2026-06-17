import type { ReactNode } from "react";
import { DartboardPaintRing } from "./DartboardPaintRing";
import { getRingRadii } from "./dartboardGeometry";
import type { BoardAreaModel, BoardState, OpColor, RingKey } from "./types";
import type { SelectedTarget } from "./dartboardState";

type RenderContext = {
  area: BoardAreaModel;
  board: BoardState;
  selection: SelectedTarget;
  wedgeAngle: number;
  startBase: number;
  onCycleWedge: (ring: RingKey, idx: number) => void;
  resolveFill: (color: OpColor | null, fallback: string) => string;
  fallbackByRing: Record<RingKey, (index: number) => string>;
};

type AreaRenderer = (context: RenderContext) => ReactNode;

const renderPaintRingArea: AreaRenderer = ({
  area,
  board,
  selection,
  wedgeAngle,
  startBase,
  onCycleWedge,
  resolveFill,
  fallbackByRing,
}) => {
  const ring = area.ring;
  const { rIn, rOut } = getRingRadii(ring);

  return (
    <DartboardPaintRing
      key={ring}
      ring={ring}
      wedgeAngle={wedgeAngle}
      startBase={startBase}
      rIn={rIn}
      rOut={rOut}
      wedgeColors={board.wedges[ring]}
      thirdColors={board.thirds[ring]}
      selectedWedgeIndex={selection.zone === ring ? selection.wedgeIndex : null}
      onCycleWedge={onCycleWedge}
      resolveFill={resolveFill}
      fallbackForIndex={fallbackByRing[ring]}
    />
  );
};

export const BOARD_AREA_RENDER_REGISTRY: Record<string, AreaRenderer> = {
  "ring:inner": renderPaintRingArea,
  "ring:triple": renderPaintRingArea,
  "ring:middle": renderPaintRingArea,
  "ring:outer": renderPaintRingArea,
};

export function renderBoardArea(context: RenderContext) {
  const renderer = BOARD_AREA_RENDER_REGISTRY[context.area.id];
  if (!renderer) return null;
  return renderer(context);
}

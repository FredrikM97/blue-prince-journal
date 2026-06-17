import type { RingKey } from "./types";

export function getBoardFrameGeometry() {
  return {
    boardSize: 800,
    viewboxPadding: 44,
    outerRadius: 392,
  } as const;
}

export function getOuterModifierRingGeometry() {
  return {
    rIn: 394,
    rOut: 432,
  } as const;
}

export function getNumberRingGeometry() {
  return {
    rIn: 340,
    rOut: 388,
  } as const;
}

function getInnerRingGeometry() {
  return buildRingGeometry(RING_BOUNDARIES.inner.rIn, RING_BOUNDARIES.inner.rOut);
}

function getTripleRingGeometry() {
  return buildRingGeometry(RING_BOUNDARIES.triple.rIn, RING_BOUNDARIES.triple.rOut);
}

function getMiddleRingGeometry() {
  return buildRingGeometry(RING_BOUNDARIES.middle.rIn, RING_BOUNDARIES.middle.rOut);
}

function getOuterRingGeometry() {
  return buildRingGeometry(RING_BOUNDARIES.outer.rIn, RING_BOUNDARIES.outer.rOut);
}

const RING_BOUNDARIES = {
  inner: { rIn: 36, rOut: 206 },
  triple: { rIn: 206, rOut: 224 },
  middle: { rIn: 224, rOut: 322 },
  outer: { rIn: 322, rOut: 340 },
} as const;

function buildRingGeometry(rIn: number, rOut: number) {
  return {
    rIn,
    rOut,
  } as const;
}

export function getCenterZoneGeometry() {
  return {
    outerBullRadius: 36,
    bullseyeRadius: 16,
  } as const;
}

export function getNumberLabelRadius() {
  const numberRing = getNumberRingGeometry();
  return (numberRing.rOut + numberRing.rIn) / 2;
}

export function getOuterModifierLabelRadius() {
  const outerModifierRing = getOuterModifierRingGeometry();
  return (outerModifierRing.rOut + outerModifierRing.rIn) / 2;
}

const BOARD_FRAME = getBoardFrameGeometry();
const OUTER_MODIFIER_RING = getOuterModifierRingGeometry();
const NUMBER_RING = getNumberRingGeometry();

const BOARD_CENTER_X = BOARD_FRAME.boardSize / 2;
const BOARD_CENTER_Y = BOARD_FRAME.boardSize / 2;
const NUMBER_RING_OUTER_RADIUS = NUMBER_RING.rOut;
const NUMBER_RING_INNER_RADIUS = NUMBER_RING.rIn;

export function getBoardCenter() {
  return {
    x: BOARD_CENTER_X,
    y: BOARD_CENTER_Y,
  } as const;
}

export type BoardCenterShape = {
  center: { x: number; y: number };
  outerBullRadius: number;
  bullseyeRadius: number;
};

export function getBoardCenterShape(): BoardCenterShape {
  const center = getBoardCenter();
  const centerZone = getCenterZoneGeometry();
  return {
    center,
    outerBullRadius: centerZone.outerBullRadius,
    bullseyeRadius: centerZone.bullseyeRadius,
  };
}

function getInnerSingleAreaRadii() {
  return getInnerRingGeometry();
}

function getTripleAreaRadii() {
  return getTripleRingGeometry();
}

function getOuterSingleAreaRadii() {
  return getMiddleRingGeometry();
}

function getDoubleAreaRadii() {
  return getOuterRingGeometry();
}

function getNumberRingAreaRadii() {
  return {
    rIn: NUMBER_RING_INNER_RADIUS,
    rOut: NUMBER_RING_OUTER_RADIUS,
  } as const;
}

function getOuterModifierAreaRadii() {
  return {
    rIn: OUTER_MODIFIER_RING.rIn,
    rOut: OUTER_MODIFIER_RING.rOut,
  } as const;
}

export function getRingRadii(ring: RingKey) {
  if (ring === "inner") return getInnerSingleAreaRadii();
  if (ring === "triple") return getTripleAreaRadii();
  if (ring === "middle") return getOuterSingleAreaRadii();
  return getDoubleAreaRadii();
}

export function getNumberRingRadii() {
  return getNumberRingAreaRadii();
}

export function getOuterModifierRadii() {
  return getOuterModifierAreaRadii();
}

export type BoardAreaKind = RingKey | "numberRing" | "outerModifierRing";

type BoardAreaShapeDefinition = {
  getRadii: () => { rIn: number; rOut: number };
  buildPath: (a0: number, a1: number) => string;
};

export type SectorRadii = {
  rIn: number;
  rOut: number;
};

function buildBoardAreaShapeDefinition(getRadii: () => { rIn: number; rOut: number }): BoardAreaShapeDefinition {
  return {
    getRadii,
    buildPath: (a0, a1) => {
      return buildSectorPathByRadii(getRadii(), a0, a1);
    },
  };
}

const BOARD_AREA_SHAPES: Record<BoardAreaKind, BoardAreaShapeDefinition> = {
  inner: buildBoardAreaShapeDefinition(getInnerSingleAreaRadii),
  triple: buildBoardAreaShapeDefinition(getTripleAreaRadii),
  middle: buildBoardAreaShapeDefinition(getOuterSingleAreaRadii),
  outer: buildBoardAreaShapeDefinition(getDoubleAreaRadii),
  numberRing: buildBoardAreaShapeDefinition(getNumberRingAreaRadii),
  outerModifierRing: buildBoardAreaShapeDefinition(getOuterModifierAreaRadii),
};

export function getAreaRadii(area: BoardAreaKind) {
  return BOARD_AREA_SHAPES[area].getRadii();
}

export function polarToCartesian(radius: number, angle: number) {
  return [
    BOARD_CENTER_X + radius * Math.cos(angle),
    BOARD_CENTER_Y + radius * Math.sin(angle),
  ] as const;
}

function buildSectorPath(rIn: number, rOut: number, a0: number, a1: number) {
  const [x1, y1] = polarToCartesian(rOut, a0);
  const [x2, y2] = polarToCartesian(rOut, a1);
  const [x3, y3] = polarToCartesian(rIn, a1);
  const [x4, y4] = polarToCartesian(rIn, a0);
  const largeArc = a1 - a0 > Math.PI ? 1 : 0;

  return [
    `M ${x1} ${y1}`,
    `A ${rOut} ${rOut} 0 ${largeArc} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rIn} ${rIn} 0 ${largeArc} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

export function buildSectorPathByRadii(radii: SectorRadii, a0: number, a1: number) {
  return buildSectorPath(radii.rIn, radii.rOut, a0, a1);
}

export function buildAreaPathByKind(area: BoardAreaKind, a0: number, a1: number) {
  return BOARD_AREA_SHAPES[area].buildPath(a0, a1);
}

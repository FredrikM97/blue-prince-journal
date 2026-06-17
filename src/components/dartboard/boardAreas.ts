import { RINGS, type BoardAreaModel, type RingKey } from "./types";

function createRingArea(ring: RingKey): BoardAreaModel {
  return {
    id: `ring:${ring}`,
    ring,
    geometryKey: ring,
    paintSources: {
      full: "wedges",
      third: "thirds",
    },
    computeIntent: {
      includeFullWedge: true,
      includeThirdWedge: true,
    },
  };
}

export const BOARD_AREAS: BoardAreaModel[] = RINGS.map((ring) => createRingArea(ring));

export function getBoardAreas() {
  return BOARD_AREAS;
}

import { WEDGE_COUNT, nextColor, type BoardState, type OpColor, type RingKey } from "./types";

export type PaintMode = "third" | "filled";

export type SelectedZone = "center" | "bullseye" | "outerModifier" | RingKey;

export type SelectedTarget = {
  zone: SelectedZone;
  wedgeIndex: number | null;
};

export const PAINT_MODE_OPTIONS: { value: PaintMode; label: string; note: string }[] = [
  { value: "filled", label: "Filled", note: "Paint only the selected wedge area." },
  { value: "third", label: "One-third", note: "Paint one-third mode on the selected wedge area." },
];

export const DEFAULT_SELECTED_TARGET: SelectedTarget = { zone: "inner", wedgeIndex: 0 };

export function createBoardSelectionTarget(zone: SelectedZone, wedgeIndex: number | null): SelectedTarget {
  return { zone, wedgeIndex };
}

export function cycleWedgeColor(board: BoardState, ring: RingKey, wedgeIndex: number): BoardState {
  return {
    ...board,
    wedges: {
      ...board.wedges,
      [ring]: board.wedges[ring].map((color, index) =>
        index === wedgeIndex ? nextColor(color) : color,
      ),
    },
  };
}

function paintWedges(
  board: BoardState,
  ring: RingKey,
  wedgeIndexes: number[],
  color: OpColor,
): BoardState {
  const shouldClear = wedgeIndexes.every((index) => board.wedges[ring][index] === color);

  return {
    ...board,
    wedges: {
      ...board.wedges,
      [ring]: board.wedges[ring].map((currentColor, index) =>
        wedgeIndexes.includes(index) ? (shouldClear ? null : color) : currentColor,
      ),
    },
  };
}

function clearWedgesOnly(board: BoardState, ring: RingKey, wedgeIndexes: number[]): BoardState {
  return {
    ...board,
    wedges: {
      ...board.wedges,
      [ring]: board.wedges[ring].map((currentColor, index) =>
        wedgeIndexes.includes(index) ? null : currentColor,
      ),
    },
  };
}

function paintThirdSlices(
  board: BoardState,
  ring: RingKey,
  wedgeIndexes: number[],
  color: OpColor,
): BoardState {
  const shouldClear = wedgeIndexes.every((index) => board.thirds[ring][index] === color);

  return {
    ...board,
    thirds: {
      ...board.thirds,
      [ring]: board.thirds[ring].map((currentColor, index) =>
        wedgeIndexes.includes(index) ? (shouldClear ? null : color) : currentColor,
      ),
    },
  };
}

function clearThirdSlicesOnly(board: BoardState, ring: RingKey, wedgeIndexes: number[]): BoardState {
  return {
    ...board,
    thirds: {
      ...board.thirds,
      [ring]: board.thirds[ring].map((currentColor, index) =>
        wedgeIndexes.includes(index) ? null : currentColor,
      ),
    },
  };
}

function clearWedges(board: BoardState, ring: RingKey, wedgeIndexes: number[]): BoardState {
  return {
    ...board,
    wedges: {
      ...board.wedges,
      [ring]: board.wedges[ring].map((currentColor, index) =>
        wedgeIndexes.includes(index) ? null : currentColor,
      ),
    },
  };
}

function clearThirdSlices(board: BoardState, ring: RingKey, wedgeIndexes: number[]): BoardState {
  return {
    ...board,
    thirds: {
      ...board.thirds,
      [ring]: board.thirds[ring].map((currentColor, index) =>
        wedgeIndexes.includes(index) ? null : currentColor,
      ),
    },
  };
}

function getSpanWedgeIndexes(wedgeIndex: number, span: number): number[] {
  if (span === 1) return [wedgeIndex];
  if (span === WEDGE_COUNT) return [...Array(WEDGE_COUNT).keys()];

  const halfSpan = Math.floor(span / 2);
  return Array.from(
    { length: span },
    (_, offset) => (wedgeIndex - halfSpan + offset + WEDGE_COUNT) % WEDGE_COUNT,
  );
}

export function applyPaintSelection(
  board: BoardState,
  selection: SelectedTarget,
  color: OpColor | null,
  mode: PaintMode,
  advanced: boolean,
): BoardState {
  if (!color) return board;
  if (!canPaintSelection(selection, advanced)) return board;

  const wedgeIndex = selection.wedgeIndex ?? 0;
  const wedgeIndexes = getSpanWedgeIndexes(wedgeIndex, 1);

  if (mode === "third") {
    const boardWithoutFilled = clearWedgesOnly(board, selection.zone, wedgeIndexes);
    return paintThirdSlices(boardWithoutFilled, selection.zone, wedgeIndexes, color);
  }

  const boardWithoutThird = clearThirdSlicesOnly(board, selection.zone, wedgeIndexes);
  return paintWedges(boardWithoutThird, selection.zone, wedgeIndexes, color);
}

export function applyClearSelection(
  board: BoardState,
  selection: SelectedTarget,
  mode: PaintMode,
  advanced: boolean,
): BoardState {
  if (!canPaintSelection(selection, advanced)) return board;

  const wedgeIndex = selection.wedgeIndex ?? 0;
  const wedgeIndexes = getSpanWedgeIndexes(wedgeIndex, 1);

  if (mode === "third") {
    return clearThirdSlices(board, selection.zone, wedgeIndexes);
  }

  return clearWedges(board, selection.zone, wedgeIndexes);
}

export function canPaintSelection(
  selection: SelectedTarget,
  advanced: boolean,
): selection is SelectedTarget & { zone: RingKey } {
  if (selection.zone === "center" || selection.zone === "bullseye" || selection.zone === "outerModifier") {
    return false;
  }
  void advanced;
  return true;
}

export function clearSelectedBoardArea(board: BoardState, selection: SelectedTarget): BoardState {
  if (selection.zone === "center" || selection.zone === "bullseye" || selection.zone === "outerModifier") {
    return board;
  }
  if (selection.wedgeIndex === null) return board;

  return {
    ...board,
    wedges: {
      ...board.wedges,
      [selection.zone]: board.wedges[selection.zone].map((color, index) =>
        index === selection.wedgeIndex ? null : color,
      ),
    },
    thirds: {
      ...board.thirds,
      [selection.zone]: board.thirds[selection.zone].map((color, index) =>
        index === selection.wedgeIndex ? null : color,
      ),
    },
  };
}
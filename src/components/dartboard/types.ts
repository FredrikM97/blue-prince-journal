export type OpColor = "blue" | "pink" | "yellow" | "purple";

export const WEDGE_COUNT = 20;
// Standard dartboard wedge order, starting at top (20) and going clockwise.
export const WEDGE_ORDER = [
  20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5,
];

// Cycle order when clicking a wedge.
export const COLOR_CYCLE: (OpColor | null)[] = [null, "blue", "pink", "yellow", "purple"];

// Paintable wedge rings, center -> outward.
export type RingKey = "inner" | "triple" | "middle" | "outer";
export const RINGS: RingKey[] = ["inner", "triple", "middle", "outer"];

export type BoardState = {
  wedges: Record<RingKey, (OpColor | null)[]>;
  thirds: Record<RingKey, (OpColor | null)[]>;
};

export type ModifierZone = "center" | "bullseye" | "outer";

export type ModifierState = {
  center: Set<string>;
  bullseye: Set<string>;
  outer: (string | null)[];
};

export type ModifierDef = {
  id: string;
  glyph: string;
  label: string;
  note: string;
};

export const OPERATORS: Record<
  OpColor,
  { symbol: string; label: string; swatch: string }
> = {
  blue:   { symbol: "+", label: "Add",      swatch: "var(--op-blue)" },
  pink:   { symbol: "×", label: "Multiply", swatch: "var(--op-pink)" },
  yellow: { symbol: "−", label: "Subtract", swatch: "var(--op-yellow)" },
  purple: { symbol: "÷", label: "Divide",   swatch: "var(--op-purple)" },
};

export function emptyBoard(): BoardState {
  return {
    wedges: {
      inner:  Array(WEDGE_COUNT).fill(null),
      triple: Array(WEDGE_COUNT).fill(null),
      middle: Array(WEDGE_COUNT).fill(null),
      outer:  Array(WEDGE_COUNT).fill(null),
    },
    thirds: {
      inner:  Array(WEDGE_COUNT).fill(null),
      triple: Array(WEDGE_COUNT).fill(null),
      middle: Array(WEDGE_COUNT).fill(null),
      outer:  Array(WEDGE_COUNT).fill(null),
    },
  };
}

export function emptyModifierState(): ModifierState {
  return {
    center: new Set<string>(),
    bullseye: new Set<string>(),
    outer: Array(WEDGE_COUNT).fill(null),
  };
}

export function nextColor(c: OpColor | null): OpColor | null {
  const i = COLOR_CYCLE.indexOf(c);
  return COLOR_CYCLE[(i + 1) % COLOR_CYCLE.length];
}

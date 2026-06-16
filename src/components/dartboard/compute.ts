import { MODIFIER_EFFECTS, MODIFIER_PRESETS } from "./modifiers";
import {
  applyOperator,
  formatModifierStepLabel,
  formatOperationStepLabel,
  roundNice,
} from "./computeUtils";
import {
  OPERATORS,
  RINGS,
  WEDGE_ORDER,
  type BoardState,
  type ModifierState,
  type OpColor,
  type RingKey,
} from "./types";

export type Step = {
  kind: "start" | "operation" | "modifier";
  ring: RingKey | "center";
  wedgeIndex: number; // -1 for center
  wedgeValue: number;
  color: OpColor | "bullseye" | "modifier";
  symbol: string;
  before: number;
  after: number;
  label: string;
};

export { roundNice };

function pushModifierStep(
  steps: Step[],
  label: string,
  before: number,
  after: number,
  symbol = "✦",
) {
  steps.push({
    kind: "modifier",
    ring: "center",
    wedgeIndex: -1,
    wedgeValue: 0,
    color: "modifier",
    symbol,
    before,
    after,
    label: formatModifierStepLabel(label, after),
  });
}

function createEmptyModifierState(): ModifierState {
  return {
    center: new Set<string>(),
    bullseye: new Set<string>(),
    outer: Array(WEDGE_ORDER.length).fill(null),
  };
}

function repeatLastOperation(
  acc: number,
  lastOperation: { color: OpColor; operand: number } | null,
  repeatCount: number,
  steps: Step[],
) {
  let current = acc;
  if (!lastOperation) return current;

  for (let index = 0; index < repeatCount; index += 1) {
    const before = current;
    current = applyOperator(current, lastOperation.color, lastOperation.operand);
    pushModifierStep(
      steps,
      `outer modifier · Repeat ${index + 1}/${repeatCount}`,
      before,
      current,
      "·",
    );
  }

  return current;
}

export function compute(
  board: BoardState,
  opts: { advanced: boolean; modifiers?: ModifierState },
): { result: number | null; steps: Step[]; error?: string } {
  const steps: Step[] = [];
  const modifiers = opts.modifiers ?? createEmptyModifierState();
  let acc = 0;
  steps.push({
    kind: "start",
    ring: "center",
    wedgeIndex: -1,
    wedgeValue: acc,
    color: "bullseye",
    symbol: "=",
    before: 0,
    after: acc,
    label: `start = ${acc}`,
  });

  const activeRings: RingKey[] = RINGS;
  const activeCenterModifiers = modifiers.center;
  const activeBullseyeModifiers = modifiers.bullseye;
  const activeOuterModifiers = new Set(
    modifiers.outer.filter((id): id is string => id !== null),
  );
  let lastOperation: { color: OpColor; operand: number; ring: RingKey; wedgeIndex: number } | null = null;

  for (const ring of activeRings) {
    const row = board.wedges[ring];
    const thirdRow = board.thirds[ring];
    for (let i = 0; i < row.length; i++) {
      const color = row[i];
      if (!color) continue;

      const operationColor = color;
      const operand = WEDGE_ORDER[i];
      const before = acc;
      try {
        acc = applyOperator(acc, operationColor, operand);
      } catch (error) {
        return {
          result: null,
          steps,
          error: error instanceof Error ? error.message : "Unable to apply operation.",
        };
      }

      steps.push({
        kind: "operation",
        ring,
        wedgeIndex: i,
        wedgeValue: operand,
        color: operationColor,
        symbol: OPERATORS[operationColor].symbol,
        before,
        after: acc,
        label: formatOperationStepLabel(ring, operationColor, operand, acc),
      });

      lastOperation = { color: operationColor, operand, ring, wedgeIndex: i };
    }

    for (let i = 0; i < thirdRow.length; i++) {
      const color = thirdRow[i];
      if (!color) continue;

      const operationColor = color;
      const operand = WEDGE_ORDER[i] / 3;
      const before = acc;
      try {
        acc = applyOperator(acc, operationColor, operand);
      } catch (error) {
        return {
          result: null,
          steps,
          error: error instanceof Error ? error.message : "Unable to apply operation.",
        };
      }

      steps.push({
        kind: "operation",
        ring,
        wedgeIndex: i,
        wedgeValue: operand,
        color: operationColor,
        symbol: `${OPERATORS[operationColor].symbol}⅓`,
        before,
        after: acc,
        label: `${ring} · ${OPERATORS[operationColor].symbol} ${roundNice(operand)} (1/3) → ${roundNice(acc)}`,
      });

      lastOperation = { color: operationColor, operand, ring, wedgeIndex: i };
    }
  }

  function applyFinalModifier(zone: "center" | "bullseye" | "outer", activeIds: Set<string>) {
    const modifier = MODIFIER_PRESETS[zone].find((item) => activeIds.has(item.id));
    if (!modifier) return;

    const effect = MODIFIER_EFFECTS[zone][modifier.id];
    if (!effect || effect.kind === "none") return;

    const before = acc;
    const context = {
      repeatLastOperation: (repeatCount: number) => repeatLastOperation(acc, lastOperation, repeatCount, steps),
      skipToLastOperationBefore: () => {
        const lastOperationStep = [...steps].reverse().find((step) => step.kind === "operation");
        return lastOperationStep ? lastOperationStep.before : null;
      },
    };

    acc = effect.operator(acc, context);
    if (before !== acc) {
      pushModifierStep(steps, `${zone} modifier · ${modifier.label}`, before, acc, modifier.glyph);
    }
  }

  applyFinalModifier("bullseye", activeBullseyeModifiers);
  applyFinalModifier("center", activeCenterModifiers);
  applyFinalModifier("outer", activeOuterModifiers);

  return { result: acc, steps };
}

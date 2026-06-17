import { MODIFIER_EFFECTS, MODIFIER_PRESETS } from "./modifiers";
import {
  applyOperator,
  formatModifierStepLabel,
  formatOperationStepLabel,
  roundNice,
} from "./computeUtils";
import {
  OPERATORS,
  WEDGE_ORDER,
  type BoardState,
  type ModifierState,
  type OpColor,
  type RingKey,
  emptyModifierState,
} from "./types";
import { getBoardAreas } from "./boardAreas";

export type Step = {
  kind: "start" | "operation" | "modifier";
  ring: RingKey | "center";
  wedgeIndex: number; // -1 for center
  wedgeValue: number;
  color: OpColor | "meta";
  symbol: string;
  before: number;
  after: number;
  label: string;
};

type OperationEntry = {
  ring: RingKey;
  wedgeIndex: number;
  color: OpColor;
  operand: number;
  symbol: string;
  label: (result: number) => string;
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
    color: "meta",
    symbol,
    before,
    after,
    label: formatModifierStepLabel(label, after),
  });
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
  const modifiers = opts.modifiers ?? emptyModifierState();
  let acc = 0;
  steps.push({
    kind: "start",
    ring: "center",
    wedgeIndex: -1,
    wedgeValue: acc,
    color: "meta",
    symbol: "=",
    before: 0,
    after: acc,
    label: `start = ${acc}`,
  });

  const activeCenterModifiers = modifiers.center;
  const activeBullseyeModifiers = modifiers.bullseye;
  let lastOperation: { color: OpColor; operand: number; ring: RingKey; wedgeIndex: number } | null = null;

  function collectOperationEntriesFromRow(
    entries: OperationEntry[],
    ring: RingKey,
    row: (OpColor | null)[],
    operandForIndex: (index: number) => number,
    symbolForColor: (color: OpColor) => string,
    labelFor: (color: OpColor, operand: number, result: number) => string,
  ) {
    for (let i = 0; i < row.length; i++) {
      const color = row[i];
      if (!color) continue;

      const operand = operandForIndex(i);
      entries.push({
        ring,
        wedgeIndex: i,
        color,
        operand,
        symbol: symbolForColor(color),
        label: (result) => labelFor(color, operand, result),
      });
    }
  }

  function buildAreaFullWedgeEntries(entries: OperationEntry[], ring: RingKey) {
    collectOperationEntriesFromRow(
      entries,
      ring,
      board.wedges[ring],
      (index) => WEDGE_ORDER[index],
      (color) => OPERATORS[color].symbol,
      (color, operand, result) => formatOperationStepLabel(ring, color, operand, result),
    );
  }

  function buildAreaThirdWedgeEntries(entries: OperationEntry[], ring: RingKey) {
    collectOperationEntriesFromRow(
      entries,
      ring,
      board.thirds[ring],
      (index) => WEDGE_ORDER[index] / 3,
      (color) => `${OPERATORS[color].symbol}⅓`,
      (color, operand, result) =>
        `${ring} · ${OPERATORS[color].symbol} ${roundNice(operand)} (1/3) → ${roundNice(result)}`,
    );
  }

  function buildOperationEntries(): OperationEntry[] {
    const entries: OperationEntry[] = [];
    for (const area of getBoardAreas()) {
      const { ring, computeIntent } = area;
      if (computeIntent.includeFullWedge) {
        buildAreaFullWedgeEntries(entries, ring);
      }

      if (computeIntent.includeThirdWedge) {
        buildAreaThirdWedgeEntries(entries, ring);
      }
    }
    return entries;
  }

  const operationEntries = buildOperationEntries();
  for (const entry of operationEntries) {
    const { ring, wedgeIndex, color, operand, symbol, label } = entry;
      const before = acc;
      try {
        acc = applyOperator(acc, color, operand);
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
        wedgeIndex,
        wedgeValue: operand,
        color,
        symbol,
        before,
        after: acc,
        label: label(acc),
      });

      lastOperation = { color, operand, ring, wedgeIndex };
  }

  function applyFinalModifierById(
    zone: "center" | "bullseye" | "outer",
    id: string,
    labelPrefix = `${zone} modifier`,
  ) {
    const modifier = MODIFIER_PRESETS[zone].find((item) => item.id === id);
    if (!modifier) return;

    const effect = MODIFIER_EFFECTS[zone][modifier.id];
    if (!effect) return;

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
      pushModifierStep(steps, `${labelPrefix} · ${modifier.label}`, before, acc, modifier.glyph);
    }
  }

  function applyBullseyeModifiersPhase() {
    const activeBullseyeId = MODIFIER_PRESETS.bullseye.find((item) => activeBullseyeModifiers.has(item.id))?.id;
    if (!activeBullseyeId) return;
    applyFinalModifierById("bullseye", activeBullseyeId);
  }

  function applyCenterModifiersPhase() {
    const activeCenterId = MODIFIER_PRESETS.center.find((item) => activeCenterModifiers.has(item.id))?.id;
    if (!activeCenterId) return;
    applyFinalModifierById("center", activeCenterId);
  }

  function applyOuterModifiersPhase() {
    modifiers.outer.forEach((id, wedgeIndex) => {
      if (!id) return;
      applyFinalModifierById("outer", id, `outer modifier · wedge ${WEDGE_ORDER[wedgeIndex]}`);
    });
  }

  applyBullseyeModifiersPhase();
  applyCenterModifiersPhase();
  applyOuterModifiersPhase();

  return { result: acc, steps };
}

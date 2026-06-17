import type { ModifierDef, ModifierZone } from "./types";

export type ModifierOperatorContext = {
  repeatLastOperation: (repeatCount: number) => number;
  skipToLastOperationBefore: () => number | null;
};

type ModifierOperator = (value: number, context: ModifierOperatorContext) => number;

function reverseDigitsOperator(value: number) {
  const rounded = Number.isInteger(value) ? value : Math.round(value * 1000) / 1000;
  const sign = Math.sign(rounded);
  const digits = Math.abs(rounded).toString().replace(/[^\d]/g, "");
  if (digits.length === 0) return 0;
  return sign * Number(digits.split("").reverse().join(""));
}

export type ModifierEffect =
  | { kind: "power"; operator: ModifierOperator }
  | { kind: "reverse-digits"; operator: ModifierOperator }
  | { kind: "round"; operator: ModifierOperator }
  | { kind: "divide"; operator: ModifierOperator }
  | { kind: "repeat-last-operation"; operator: ModifierOperator }
  | { kind: "skip-last-operation"; operator: ModifierOperator };

type ModifierRegistryItem = ModifierDef & {
  effect: ModifierEffect;
};

const MODIFIER_REGISTRY: Record<ModifierZone, ModifierRegistryItem[]> = {
  center: [
    { id: "square", glyph: "□", label: "Square", note: "Square the number (n²).", effect: { kind: "power", operator: (value) => value ** 2 } },
    { id: "quartic", glyph: "□□", label: "Two Squares", note: "Raise the number to the 4th power (n⁴).", effect: { kind: "power", operator: (value) => value ** 4 } },
    { id: "reverse", glyph: "◊", label: "Diamond", note: "Reverse the digits.", effect: { kind: "reverse-digits", operator: reverseDigitsOperator } },
    { id: "round1", glyph: "≈", label: "Round to 1", note: "Round to the nearest 1.", effect: { kind: "round", operator: (value) => Math.round(value) } },
    { id: "round10", glyph: "≈≈", label: "Round to 10", note: "Round to the nearest 10.", effect: { kind: "round", operator: (value) => Math.round(value / 10) * 10 } },
    { id: "round100", glyph: "≈≈≈", label: "Round to 100", note: "Round to the nearest 100.", effect: { kind: "round", operator: (value) => Math.round(value / 100) * 100 } },
    { id: "third", glyph: "⅓", label: "Divide by 3", note: "Divide by 3.", effect: { kind: "divide", operator: (value) => value / 3 } },
    { id: "repeat2", glyph: "••", label: "Repeat 2×", note: "Repeat the last step 2 times.", effect: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(2) } },
    { id: "repeat3", glyph: "•••", label: "Repeat 3×", note: "Repeat the last step 3 times.", effect: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(3) } },
    { id: "repeat4", glyph: "••••", label: "Repeat 4×", note: "Repeat the last step 4 times.", effect: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(4) } },
  ],
  bullseye: [
    { id: "square", glyph: "□", label: "Square", note: "Square the number (n²).", effect: { kind: "power", operator: (value) => value ** 2 } },
    { id: "quartic", glyph: "□□", label: "Two Squares", note: "Raise the number to the 4th power (n⁴).", effect: { kind: "power", operator: (value) => value ** 4 } },
    { id: "reverse", glyph: "◊", label: "Diamond", note: "Reverse the digits.", effect: { kind: "reverse-digits", operator: reverseDigitsOperator } },
    { id: "round1", glyph: "≈", label: "Round to 1", note: "Round to the nearest 1.", effect: { kind: "round", operator: (value) => Math.round(value) } },
    { id: "round10", glyph: "≈≈", label: "Round to 10", note: "Round to the nearest 10.", effect: { kind: "round", operator: (value) => Math.round(value / 10) * 10 } },
    { id: "round100", glyph: "≈≈≈", label: "Round to 100", note: "Round to the nearest 100.", effect: { kind: "round", operator: (value) => Math.round(value / 100) * 100 } },
    { id: "third", glyph: "⅓", label: "Divide by 3", note: "Divide by 3.", effect: { kind: "divide", operator: (value) => value / 3 } },
    { id: "repeat2", glyph: "••", label: "Repeat 2×", note: "Repeat the last step 2 times.", effect: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(2) } },
    { id: "repeat3", glyph: "•••", label: "Repeat 3×", note: "Repeat the last step 3 times.", effect: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(3) } },
    { id: "repeat4", glyph: "••••", label: "Repeat 4×", note: "Repeat the last step 4 times.", effect: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(4) } },
  ],
  outer: [
    { id: "skip", glyph: "X", label: "Cross", note: "Skip the last step.", effect: { kind: "skip-last-operation", operator: (value, context) => context.skipToLastOperationBefore() ?? value } },
    { id: "half", glyph: "/", label: "Diagonal Line", note: "Divide the final number by 2.", effect: { kind: "divide", operator: (value) => value / 2 } },
    { id: "repeat2", glyph: "··", label: "Two Dots", note: "Repeat the last step 2 times.", effect: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(2) } },
    { id: "repeat3", glyph: "···", label: "Three Dots", note: "Repeat the last step 3 times.", effect: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(3) } },
    { id: "repeat4", glyph: "····", label: "Four Dots", note: "Repeat the last step 4 times.", effect: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(4) } },
    { id: "square", glyph: "□", label: "Square", note: "Square the number (n²).", effect: { kind: "power", operator: (value) => value ** 2 } },
    { id: "quartic", glyph: "□□", label: "Two Squares", note: "Raise the number to the 4th power (n⁴).", effect: { kind: "power", operator: (value) => value ** 4 } },
    { id: "reverse", glyph: "◊", label: "Diamond", note: "Reverse the digits.", effect: { kind: "reverse-digits", operator: reverseDigitsOperator } },
    { id: "round1", glyph: "≈", label: "Single Wavy", note: "Round to the nearest 1.", effect: { kind: "round", operator: (value) => Math.round(value) } },
    { id: "round10", glyph: "≈≈", label: "Double Wavy", note: "Round to the nearest 10.", effect: { kind: "round", operator: (value) => Math.round(value / 10) * 10 } },
    { id: "round100", glyph: "≈≈≈", label: "Triple Wavy", note: "Round to the nearest 100.", effect: { kind: "round", operator: (value) => Math.round(value / 100) * 100 } },
    { id: "third", glyph: "⅓", label: "One Third", note: "Divide the final number by 3.", effect: { kind: "divide", operator: (value) => value / 3 } },
  ],
};

function toEffectMap(items: ModifierRegistryItem[]) {
  return Object.fromEntries(items.map((item) => [item.id, item.effect])) as Record<string, ModifierEffect>;
}

function toPresetList(items: ModifierRegistryItem[]) {
  return items.map(({ id, glyph, label, note }) => ({ id, glyph, label, note }));
}

export const MODIFIER_EFFECTS: Record<ModifierZone, Record<string, ModifierEffect>> = {
  center: toEffectMap(MODIFIER_REGISTRY.center),
  bullseye: toEffectMap(MODIFIER_REGISTRY.bullseye),
  outer: toEffectMap(MODIFIER_REGISTRY.outer),
};

/**
 * Preset modifiers grouped by zone. Each is a togglable chip in the UI.
 * Add new ones by appending to the relevant array.
 */
export const MODIFIER_PRESETS: Record<ModifierZone, ModifierDef[]> = {
  center: toPresetList(MODIFIER_REGISTRY.center),
  bullseye: toPresetList(MODIFIER_REGISTRY.bullseye),
  outer: toPresetList(MODIFIER_REGISTRY.outer),
};

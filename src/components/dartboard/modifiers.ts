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
  | { kind: "none"; operator: ModifierOperator }
  | { kind: "power"; operator: ModifierOperator }
  | { kind: "reverse-digits"; operator: ModifierOperator }
  | { kind: "round"; operator: ModifierOperator }
  | { kind: "divide"; operator: ModifierOperator }
  | { kind: "repeat-last-operation"; operator: ModifierOperator }
  | { kind: "skip-last-operation"; operator: ModifierOperator };

export const MODIFIER_EFFECTS: Record<ModifierZone, Record<string, ModifierEffect>> = {
  center: {
    none: { kind: "none", operator: (value) => value },
    square: { kind: "power", operator: (value) => value ** 2 },
    quartic: { kind: "power", operator: (value) => value ** 4 },
    reverse: { kind: "reverse-digits", operator: reverseDigitsOperator },
    round1: { kind: "round", operator: (value) => Math.round(value) },
    round10: { kind: "round", operator: (value) => Math.round(value / 10) * 10 },
    round100: { kind: "round", operator: (value) => Math.round(value / 100) * 100 },
    third: { kind: "divide", operator: (value) => value / 3 },
    repeat2: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(2) },
    repeat3: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(3) },
    repeat4: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(4) },
  },
  bullseye: {
    square: { kind: "power", operator: (value) => value ** 2 },
    quartic: { kind: "power", operator: (value) => value ** 4 },
    reverse: { kind: "reverse-digits", operator: reverseDigitsOperator },
    round1: { kind: "round", operator: (value) => Math.round(value) },
    round10: { kind: "round", operator: (value) => Math.round(value / 10) * 10 },
    round100: { kind: "round", operator: (value) => Math.round(value / 100) * 100 },
    third: { kind: "divide", operator: (value) => value / 3 },
    repeat2: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(2) },
    repeat3: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(3) },
    repeat4: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(4) },
  },
  outer: {
    skip: {
      kind: "skip-last-operation",
      operator: (value, context) => context.skipToLastOperationBefore() ?? value,
    },
    half: { kind: "divide", operator: (value) => value / 2 },
    repeat2: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(2) },
    repeat3: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(3) },
    repeat4: { kind: "repeat-last-operation", operator: (_value, context) => context.repeatLastOperation(4) },
    square: { kind: "power", operator: (value) => value ** 2 },
    quartic: { kind: "power", operator: (value) => value ** 4 },
    reverse: { kind: "reverse-digits", operator: reverseDigitsOperator },
    round1: { kind: "round", operator: (value) => Math.round(value) },
    round10: { kind: "round", operator: (value) => Math.round(value / 10) * 10 },
    round100: { kind: "round", operator: (value) => Math.round(value / 100) * 100 },
    third: { kind: "divide", operator: (value) => value / 3 },
  },
};

/**
 * Preset modifiers grouped by zone. Each is a togglable chip in the UI.
 * Add new ones by appending to the relevant array.
 */
export const MODIFIER_PRESETS: Record<ModifierZone, ModifierDef[]> = {
  center: [
    { id: "none", glyph: "None", label: "None", note: "No center modifier." },
    { id: "square", glyph: "□", label: "Square", note: "Square the number (n²)." },
    { id: "quartic", glyph: "□□", label: "Two Squares", note: "Raise the number to the 4th power (n⁴)." },
    { id: "reverse", glyph: "◊", label: "Diamond", note: "Reverse the digits." },
    { id: "round1", glyph: "≈", label: "Round to 1", note: "Round to the nearest 1." },
    { id: "round10", glyph: "≈≈", label: "Round to 10", note: "Round to the nearest 10." },
    { id: "round100", glyph: "≈≈≈", label: "Round to 100", note: "Round to the nearest 100." },
    { id: "third", glyph: "⅓", label: "Divide by 3", note: "Divide by 3." },
    { id: "repeat2", glyph: "••", label: "Repeat 2×", note: "Repeat the last step 2 times." },
    { id: "repeat3", glyph: "•••", label: "Repeat 3×", note: "Repeat the last step 3 times." },
    { id: "repeat4", glyph: "••••", label: "Repeat 4×", note: "Repeat the last step 4 times." },
  ],
  bullseye: [
    { id: "square", glyph: "□", label: "Square", note: "Square the number (n²)." },
    { id: "quartic", glyph: "□□", label: "Two Squares", note: "Raise the number to the 4th power (n⁴)." },
    { id: "reverse", glyph: "◊", label: "Diamond", note: "Reverse the digits." },
    { id: "round1", glyph: "≈", label: "Round to 1", note: "Round to the nearest 1." },
    { id: "round10", glyph: "≈≈", label: "Round to 10", note: "Round to the nearest 10." },
    { id: "round100", glyph: "≈≈≈", label: "Round to 100", note: "Round to the nearest 100." },
    { id: "third", glyph: "⅓", label: "Divide by 3", note: "Divide by 3." },
    { id: "repeat2", glyph: "••", label: "Repeat 2×", note: "Repeat the last step 2 times." },
    { id: "repeat3", glyph: "•••", label: "Repeat 3×", note: "Repeat the last step 3 times." },
    { id: "repeat4", glyph: "••••", label: "Repeat 4×", note: "Repeat the last step 4 times." },
  ],
  outer: [
    { id: "skip", glyph: "X", label: "Cross", note: "Skip the last step." },
    { id: "half", glyph: "/", label: "Diagonal Line", note: "Divide the final number by 2." },
    { id: "repeat2", glyph: "··", label: "Two Dots", note: "Repeat the last step 2 times." },
    { id: "repeat3", glyph: "···", label: "Three Dots", note: "Repeat the last step 3 times." },
    { id: "repeat4", glyph: "····", label: "Four Dots", note: "Repeat the last step 4 times." },
    { id: "square", glyph: "□", label: "Square", note: "Square the number (n²)." },
    { id: "quartic", glyph: "□□", label: "Two Squares", note: "Raise the number to the 4th power (n⁴)." },
    { id: "reverse", glyph: "◊", label: "Diamond", note: "Reverse the digits." },
    { id: "round1", glyph: "≈", label: "Single Wavy", note: "Round to the nearest 1." },
    { id: "round10", glyph: "≈≈", label: "Double Wavy", note: "Round to the nearest 10." },
    { id: "round100", glyph: "≈≈≈", label: "Triple Wavy", note: "Round to the nearest 100." },
    { id: "third", glyph: "⅓", label: "One Third", note: "Divide the final number by 3." },
  ],
};

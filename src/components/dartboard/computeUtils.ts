import { OPERATORS, type OpColor, type RingKey } from "./types";

export function roundNice(n: number) {
  if (Number.isInteger(n)) return n;
  return Math.round(n * 1000) / 1000;
}

export function applyOperator(value: number, color: OpColor, operand: number) {
  switch (color) {
    case "blue":
      return value + operand;
    case "pink":
      return value * operand;
    case "yellow":
      return value - operand;
    case "purple":
      if (operand === 0) {
        throw new Error("Cannot divide by 0.");
      }
      return value / operand;
  }
}

export function formatOperationStepLabel(
  ring: RingKey,
  color: OpColor,
  operand: number,
  result: number,
) {
  return `${ring} · ${OPERATORS[color].symbol} ${operand} → ${roundNice(result)}`;
}

export function formatModifierStepLabel(label: string, result: number) {
  return `${label} → ${roundNice(result)}`;
}

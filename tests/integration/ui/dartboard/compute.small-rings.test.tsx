import { describe, expect, it } from "vitest";
import { compute } from "@/components/dartboard/compute";
import { emptyBoard } from "@/components/dartboard/types";

describe("compute small ring contribution", () => {
  it("includes inner ring wedges", () => {
    const board = emptyBoard();
    board.wedges.inner[0] = "blue";

    const result = compute(board, { advanced: false });

    expect(result.result).toBe(20);
    expect(result.steps.some((step) => step.kind === "operation" && step.ring === "inner")).toBe(true);
  });

  it("includes triple ring wedges", () => {
    const board = emptyBoard();
    board.wedges.triple[0] = "blue";

    const result = compute(board, { advanced: false });

    expect(result.result).toBe(20);
    expect(result.steps.some((step) => step.kind === "operation" && step.ring === "triple")).toBe(true);
  });

  it("includes middle ring wedges", () => {
    const board = emptyBoard();
    board.wedges.middle[0] = "blue";

    const result = compute(board, { advanced: false });

    expect(result.result).toBe(20);
    expect(result.steps.some((step) => step.kind === "operation" && step.ring === "middle")).toBe(true);
  });
});

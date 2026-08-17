import { MODIFIER_PRESETS } from "./modifiers";
import { WEDGE_ORDER } from "./types";
import { buildAreaPathByKind, getOuterModifierLabelRadius, polarToCartesian } from "./dartboardGeometry";
import type { SelectedTarget } from "./dartboardState";
import type { OuterModifierWedgeViewModel } from "./DartboardOuterModifierRing";

const DEFAULT_OUTER_MODIFIER_FILL = "oklch(0.20 0.02 260)";

export function selectOuterModifierWedges(params: {
  outerModifierAssignments: (string | null)[];
  selection: SelectedTarget;
  startBase: number;
  wedgeAngle: number;
  operatorSwatches: (string | null)[];
}): OuterModifierWedgeViewModel[] {
  const { outerModifierAssignments, selection, startBase, wedgeAngle, operatorSwatches } = params;

  return WEDGE_ORDER.map((wedgeNumber, index) => {
    const assignedId = outerModifierAssignments[index] ?? null;
    const modifier = assignedId
      ? MODIFIER_PRESETS.outer.find((item) => item.id === assignedId) ?? null
      : null;
    const a0 = startBase + index * wedgeAngle;
    const a1 = a0 + wedgeAngle;
    const aMid = (a0 + a1) / 2;
    const [labelX, labelY] = polarToCartesian(getOuterModifierLabelRadius(), aMid);
    const isSelected = selection.zone === "outerModifier" && selection.wedgeIndex === index;
    const isActive = modifier !== null;

    return {
      index,
      wedgeNumber,
      path: buildAreaPathByKind("outerModifierRing", a0, a1),
      labelX,
      labelY,
      title: modifier ? `${modifier.label} — ${modifier.note}` : "Outer modifier slot (unassigned)",
      glyph: modifier?.glyph ?? null,
      fill:
        isActive && assignedId
          ? `color-mix(in oklab, ${operatorSwatches[index] ?? "var(--accent)"} 55%, var(--board-black))`
          : DEFAULT_OUTER_MODIFIER_FILL,
      stroke: "var(--board-stroke)",
      strokeWidth: 1,
      isSelected,
      isActive,
    };
  });
}

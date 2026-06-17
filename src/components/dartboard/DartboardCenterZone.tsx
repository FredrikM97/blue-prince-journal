import { getBoardCenterShape } from "./dartboardGeometry";
import { OPERATORS, type OpColor } from "./types";

type Props = {
  centerSelected: boolean;
  bullseyeSelected: boolean;
  centerModifierGlyph: string | null;
  bullseyeModifierGlyph: string | null;
  centerModifierColor: OpColor | null;
  bullseyeModifierColor: OpColor | null;
  onSelectCenter: () => void;
  onSelectBullseye: () => void;
};

export function DartboardCenterZone({
  centerSelected,
  bullseyeSelected,
  centerModifierGlyph,
  bullseyeModifierGlyph,
  centerModifierColor,
  bullseyeModifierColor,
  onSelectCenter,
  onSelectBullseye,
}: Props) {
  const centerShape = getBoardCenterShape();
  const center = centerShape.center;
  const centerSwatch = centerModifierColor ? OPERATORS[centerModifierColor].swatch : null;
  const bullseyeSwatch = bullseyeModifierColor ? OPERATORS[bullseyeModifierColor].swatch : null;
  const centerFill = centerModifierGlyph && centerSwatch
    ? `color-mix(in oklab, ${centerSwatch} 45%, var(--board-green))`
    : "var(--board-green)";
  const bullseyeFill = bullseyeModifierGlyph && bullseyeSwatch
    ? `color-mix(in oklab, ${bullseyeSwatch} 55%, var(--board-red))`
    : "var(--board-red)";
  const modifierDisplayColor = centerSwatch ?? bullseyeSwatch ?? "white";

  return (
    <>
      <circle
        aria-label="center outer bull"
        cx={center.x}
        cy={center.y}
        r={centerShape.outerBullRadius}
        fill={centerFill}
        stroke={centerSelected ? "var(--board-number)" : "var(--board-stroke)"}
        strokeWidth={centerSelected ? 2.5 : 1}
        onClick={onSelectCenter}
        style={{
          cursor: "pointer",
          opacity: centerSelected ? 1 : 0.95,
        }}
      />
      <circle
        aria-label="center bullseye"
        cx={center.x}
        cy={center.y}
        r={centerShape.bullseyeRadius}
        fill={bullseyeFill}
        stroke={bullseyeSelected ? "var(--board-number)" : "var(--board-stroke)"}
        strokeWidth={bullseyeSelected ? 2.5 : 1}
        onClick={onSelectBullseye}
        style={{
          cursor: "pointer",
          filter: bullseyeSelected ? "drop-shadow(0 0 10px rgba(255,255,255,0.24))" : undefined,
        }}
      />
      {centerModifierGlyph ? (
        <text
          x={center.x}
          y={bullseyeModifierGlyph ? center.y - 6 : center.y + 4}
          textAnchor="middle"
          fontSize={12}
          fontWeight={700}
          fill={modifierDisplayColor}
          pointerEvents="none"
          style={{
            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.85))",
          }}
        >
          {centerModifierGlyph}
        </text>
      ) : null}
      {bullseyeModifierGlyph ? (
        <text
          x={center.x}
          y={centerModifierGlyph ? center.y + 12 : center.y + 4}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill={modifierDisplayColor}
          pointerEvents="none"
          style={{
            filter: "drop-shadow(0 0 2px rgba(0,0,0,0.85))",
          }}
        >
          {bullseyeModifierGlyph}
        </text>
      ) : null}
    </>
  );
}

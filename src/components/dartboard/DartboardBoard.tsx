import { MODIFIER_PRESETS } from "./modifiers";
import { OPERATORS, WEDGE_ORDER, type BoardState, type OpColor, type RingKey } from "./types";
import type { SelectedTarget } from "./dartboardState";

type Props = {
  board: BoardState;
  advanced: boolean;
  selection: SelectedTarget;
  outerModifierAssignments: (string | null)[];
  bullseyeModifierGlyph: string | null;
  centerModifierGlyph: string | null;
  centerModifierColor: OpColor | null;
  bullseyeModifierColor: OpColor | null;
  onSelectZone: (zone: SelectedTarget) => void;
  onCycleWedge: (ring: RingKey, idx: number) => void;
};

const SIZE = 800;
const VIEWBOX_PADDING = 44;
const CX = SIZE / 2;
const CY = SIZE / 2;
const OUTER = 392;
const OUTER_MODIFIER_OUT = 432;
const OUTER_MODIFIER_IN = 394;
const NUM_OUTER = 388;
const NUM_INNER = 340;
const DOUBLE_OUT = 340;
const DOUBLE_IN = 322;
const OUTER_SINGLE_OUT = 322;
const OUTER_SINGLE_IN = 224;
const TRIPLE_OUT = 224;
const TRIPLE_IN = 206;
const INNER_SINGLE_OUT = 206;
const INNER_SINGLE_IN = 36;
const OUTER_BULL_R = 36;
const BULL_R = 16;
const NUM_LABEL_R = (NUM_OUTER + NUM_INNER) / 2;

const OUTER_MODIFIER_SWATCH: Record<string, string> = {
  skip: "oklch(0.68 0.18 28)",
  half: "oklch(0.75 0.12 230)",
  repeat2: "oklch(0.77 0.11 150)",
  repeat3: "oklch(0.72 0.13 170)",
  repeat4: "oklch(0.67 0.15 190)",
  square: "oklch(0.80 0.12 100)",
  quartic: "oklch(0.74 0.16 92)",
  reverse: "oklch(0.74 0.14 320)",
  round1: "oklch(0.78 0.09 280)",
  round10: "oklch(0.73 0.11 300)",
  round100: "oklch(0.69 0.13 312)",
  third: "oklch(0.76 0.10 210)",
};

function pt(r: number, a: number) {
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)] as const;
}

function sectorPath(rIn: number, rOut: number, a0: number, a1: number) {
  const [x1, y1] = pt(rOut, a0);
  const [x2, y2] = pt(rOut, a1);
  const [x3, y3] = pt(rIn, a1);
  const [x4, y4] = pt(rIn, a0);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${x4} ${y4}`,
    "Z",
  ].join(" ");
}

export function DartboardBoard({
  board,
  advanced,
  selection,
  outerModifierAssignments,
  bullseyeModifierGlyph,
  centerModifierGlyph,
  centerModifierColor,
  bullseyeModifierColor,
  onSelectZone,
  onCycleWedge,
}: Props) {
  const wedgeCount = WEDGE_ORDER.length;
  const wedgeAngle = (2 * Math.PI) / wedgeCount;
  const startBase = -Math.PI / 2 - wedgeAngle / 2;
  const ringRadii: Record<RingKey, { rIn: number; rOut: number }> = {
    inner: { rIn: INNER_SINGLE_IN, rOut: INNER_SINGLE_OUT },
    triple: { rIn: TRIPLE_IN, rOut: TRIPLE_OUT },
    middle: { rIn: OUTER_SINGLE_IN, rOut: OUTER_SINGLE_OUT },
    outer: { rIn: DOUBLE_IN, rOut: DOUBLE_OUT },
  };

  function fillFor(color: OpColor | null, fallback: string) {
    return color ? OPERATORS[color].swatch : fallback;
  }

  function renderOuterModifierRing() {
    return (
      <g>
        {WEDGE_ORDER.map((_number, index) => {
          const assignedId = outerModifierAssignments[index] ?? null;
          const modifier = assignedId
            ? MODIFIER_PRESETS.outer.find((item) => item.id === assignedId) ?? null
            : null;
          const a0 = startBase + index * wedgeAngle;
          const a1 = a0 + wedgeAngle;
          const aMid = (a0 + a1) / 2;
          const [labelX, labelY] = pt((OUTER_MODIFIER_IN + OUTER_MODIFIER_OUT) / 2, aMid);
          const isSelected = selection.zone === "outerModifier" && selection.wedgeIndex === index;
          const isActive = modifier !== null;
          return (
            <g key={`outer-modifier-${index}`}>
              <path
                aria-label={`outer modifier wedge ${WEDGE_ORDER[index]}`}
                d={sectorPath(OUTER_MODIFIER_IN, OUTER_MODIFIER_OUT, a0, a1)}
                fill={
                  isActive && assignedId
                    ? `color-mix(in oklab, ${OUTER_MODIFIER_SWATCH[assignedId] ?? "var(--accent)"} 55%, var(--board-black))`
                    : "oklch(0.20 0.02 260)"
                }
                stroke={isSelected || isActive ? "var(--board-select)" : "var(--board-stroke)"}
                strokeWidth={isSelected ? 2.5 : 1}
                onClick={() => {
                  onSelectZone({ zone: "outerModifier", wedgeIndex: index });
                }}
                style={{
                  cursor: "pointer",
                  transition: "fill 120ms, stroke 120ms",
                  filter: isSelected ? "drop-shadow(0 0 10px rgba(255,255,255,0.22))" : undefined,
                }}
              >
                <title>{modifier ? `${modifier.label} — ${modifier.note}` : "Outer modifier slot (unassigned)"}</title>
              </path>
              {modifier ? (
                <text
                  x={labelX}
                  y={labelY + 3}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fill="white"
                  pointerEvents="none"
                  style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}
                >
                  {modifier.glyph}
                </text>
              ) : null}
            </g>
          );
        })}
      </g>
    );
  }

  function renderPaintRing(ring: RingKey, fallback: (index: number) => string) {
    const { rIn, rOut } = ringRadii[ring];
    const isSelectedRing = selection.zone === ring;
    const wedgeThirdAngle = wedgeAngle / 3;
    return (
      <g>
        {WEDGE_ORDER.map((_number, index) => {
          const a0 = startBase + index * wedgeAngle;
          const a1 = a0 + wedgeAngle;
          const aMid = (a0 + a1) / 2;
          const thirdA0 = aMid - wedgeThirdAngle / 2;
          const thirdA1 = aMid + wedgeThirdAngle / 2;
          const color = board.wedges[ring][index];
          const thirdColor = board.thirds[ring][index];
          const isSelectedWedge = isSelectedRing && selection.wedgeIndex === index;
          return (
            <g key={`${ring}-${index}`}>
              <path
                aria-label={`${ring} wedge ${WEDGE_ORDER[index]}`}
                d={sectorPath(rIn, rOut, a0, a1)}
                fill={fillFor(color, fallback(index))}
                stroke={isSelectedWedge ? "var(--board-select)" : "var(--board-stroke)"}
                strokeWidth={isSelectedWedge ? 2.5 : 1}
                onClick={() => {
                  onCycleWedge(ring, index);
                }}
                style={{
                  cursor: "pointer",
                  transition: "fill 120ms, stroke 120ms",
                  filter: isSelectedWedge ? "drop-shadow(0 0 12px rgba(255,255,255,0.24))" : undefined,
                }}
              >
                <title>{`${ring} · wedge ${WEDGE_ORDER[index]} — click to cycle color`}</title>
              </path>
              {thirdColor ? (
                <path
                  d={sectorPath(rIn, rOut, thirdA0, thirdA1)}
                  fill={OPERATORS[thirdColor].swatch}
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth={0.6}
                  pointerEvents="none"
                />
              ) : null}
            </g>
          );
        })}
      </g>
    );
  }

  const centerSelected = selection.zone === "center";
  const bullseyeSelected = selection.zone === "bullseye";
  const centerSwatch = centerModifierColor ? OPERATORS[centerModifierColor].swatch : null;
  const bullseyeSwatch = bullseyeModifierColor ? OPERATORS[bullseyeModifierColor].swatch : null;
  const centerFill = centerModifierGlyph && centerSwatch
    ? `color-mix(in oklab, ${centerSwatch} 45%, var(--board-green))`
    : "var(--board-green)";
  const bullseyeFill = bullseyeModifierGlyph && bullseyeSwatch
    ? `color-mix(in oklab, ${bullseyeSwatch} 55%, var(--board-red))`
    : "var(--board-red)";
  const centerModifierDisplayColor = centerSwatch ?? bullseyeSwatch ?? "white";

  return (
    <div className="relative inline-block w-full max-w-[720px]">
      <svg
        viewBox={`${-VIEWBOX_PADDING} ${-VIEWBOX_PADDING} ${SIZE + VIEWBOX_PADDING * 2} ${SIZE + VIEWBOX_PADDING * 2}`}
        className="block h-auto w-full select-none"
        style={{ filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.55))" }}
      >
        <defs>
          <radialGradient id="cabinet-grad" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="oklch(0.30 0.02 260)" />
            <stop offset="100%" stopColor="oklch(0.08 0.01 260)" />
          </radialGradient>
          <radialGradient id="shade" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
            <stop offset="70%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.45)" />
          </radialGradient>
        </defs>

        <circle cx={CX} cy={CY} r={OUTER} fill="url(#cabinet-grad)" />

  {advanced ? renderOuterModifierRing() : null}

        {WEDGE_ORDER.map((_number, index) => {
          const a0 = startBase + index * wedgeAngle;
          const a1 = a0 + wedgeAngle;
          const fill = index % 2 === 0 ? "oklch(0.18 0.015 260)" : "oklch(0.28 0.02 260)";
          return (
            <path
              key={`num-bg-${index}`}
              d={sectorPath(NUM_INNER, NUM_OUTER, a0, a1)}
              fill={fill}
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={0.8}
            />
          );
        })}

        {WEDGE_ORDER.map((number, index) => {
          const a = startBase + (index + 0.5) * wedgeAngle;
          const [x, y] = pt(NUM_LABEL_R, a);
          return (
            <text
              key={`num-${index}`}
              x={x}
              y={y + 7}
              textAnchor="middle"
              fontFamily="'UnifrakturCook', 'Georgia', serif"
              fontSize={22}
              fontWeight={700}
              fill="var(--board-number)"
              pointerEvents="none"
              style={{ letterSpacing: "0.5px" }}
            >
              {number}
            </text>
          );
        })}

        {renderPaintRing("outer", (index) => (index % 2 === 0 ? "var(--board-red)" : "var(--board-green)"))}

        {renderPaintRing("middle", (index) => (index % 2 === 0 ? "var(--board-cream)" : "var(--board-black)"))}

        {renderPaintRing("triple", (index) => (index % 2 === 0 ? "var(--board-red)" : "var(--board-green)"))}

        {renderPaintRing("inner", (index) => (index % 2 === 0 ? "var(--board-cream)" : "var(--board-black)"))}

        <circle
          aria-label="center outer bull"
          cx={CX}
          cy={CY}
          r={OUTER_BULL_R}
          fill={centerFill}
          stroke={centerSelected ? "var(--board-select)" : "var(--board-stroke)"}
          strokeWidth={centerSelected ? 2.5 : 1}
          onClick={() => onSelectZone({ zone: "center", wedgeIndex: null })}
          style={{
            cursor: "pointer",
            opacity: selection.zone !== "center" ? 0.95 : 1,
          }}
        />
        <circle
          aria-label="center bullseye"
          cx={CX}
          cy={CY}
          r={BULL_R}
          fill={bullseyeFill}
          stroke={bullseyeSelected ? "var(--board-select)" : "var(--board-stroke)"}
          strokeWidth={bullseyeSelected ? 2.5 : 1}
          onClick={() => onSelectZone({ zone: "bullseye", wedgeIndex: null })}
          style={{
            cursor: "pointer",
            filter: bullseyeSelected ? "drop-shadow(0 0 10px rgba(255,255,255,0.24))" : undefined,
          }}
        />
        {centerModifierGlyph ? (
          <text
            x={CX}
            y={bullseyeModifierGlyph ? CY - 6 : CY + 4}
            textAnchor="middle"
            fontSize={12}
            fontWeight={700}
            fill={centerModifierDisplayColor}
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
            x={CX}
            y={centerModifierGlyph ? CY + 12 : CY + 4}
            textAnchor="middle"
            fontSize={10}
            fontWeight={700}
            fill={centerModifierDisplayColor}
            pointerEvents="none"
            style={{
              filter: "drop-shadow(0 0 2px rgba(0,0,0,0.85))",
            }}
          >
            {bullseyeModifierGlyph}
          </text>
        ) : null}

        <circle cx={CX} cy={CY} r={OUTER} fill="url(#shade)" pointerEvents="none" />
      </svg>

    </div>
  );
}
import { OPERATORS, WEDGE_ORDER, type OpColor, type RingKey } from "./types";
import { buildSectorPathByRadii } from "./dartboardGeometry";

type Props = {
  ring: RingKey;
  wedgeAngle: number;
  startBase: number;
  rIn: number;
  rOut: number;
  wedgeColors: (OpColor | null)[];
  thirdColors: (OpColor | null)[];
  selectedWedgeIndex: number | null;
  onCycleWedge: (ring: RingKey, index: number) => void;
  resolveFill: (color: OpColor | null, fallback: string) => string;
  fallbackForIndex: (index: number) => string;
};

export function DartboardPaintRing({
  ring,
  wedgeAngle,
  startBase,
  rIn,
  rOut,
  wedgeColors,
  thirdColors,
  selectedWedgeIndex,
  onCycleWedge,
  resolveFill,
  fallbackForIndex,
}: Props) {
  const wedgeThirdAngle = wedgeAngle / 3;

  return (
    <g>
      {WEDGE_ORDER.map((_number, index) => {
        const a0 = startBase + index * wedgeAngle;
        const a1 = a0 + wedgeAngle;
        const aMid = (a0 + a1) / 2;
        const thirdA0 = aMid - wedgeThirdAngle / 2;
        const thirdA1 = aMid + wedgeThirdAngle / 2;
        const color = wedgeColors[index];
        const thirdColor = thirdColors[index];
        const isSelectedWedge = selectedWedgeIndex === index;

        return (
          <g key={`${ring}-${index}`}>
            <path
              aria-label={`${ring} wedge ${WEDGE_ORDER[index]}`}
              d={buildSectorPathByRadii({ rIn, rOut }, a0, a1)}
              fill={resolveFill(color, fallbackForIndex(index))}
              stroke="var(--board-stroke)"
              strokeWidth={1}
              onClick={() => {
                onCycleWedge(ring, index);
              }}
              style={{
                cursor: "pointer",
                transition: "fill 120ms, stroke 120ms",
                opacity: isSelectedWedge ? 1 : 0.96,
              }}
            >
              <title>{`${ring} · wedge ${WEDGE_ORDER[index]} — click to cycle color`}</title>
            </path>
            {thirdColor ? (
              <path
                d={buildSectorPathByRadii({ rIn, rOut }, thirdA0, thirdA1)}
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

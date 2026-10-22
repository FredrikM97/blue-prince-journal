import { useId } from "react";
import { buildSectorPathByRadii, getSectorBounds } from "./dartboardGeometry";
import { OPERATORS, type OpColor, type RingKey, WEDGE_ORDER } from "./types";

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
  const clipIdPrefix = useId().replaceAll(":", "");

  return (
    <g>
      {WEDGE_ORDER.map((number, index) => {
        const a0 = startBase + index * wedgeAngle;
        const a1 = a0 + wedgeAngle;
        const aMid = (a0 + a1) / 2;
        const thirdA0 = aMid - wedgeThirdAngle / 2;
        const thirdA1 = aMid + wedgeThirdAngle / 2;
        const color = wedgeColors[index];
        const thirdColor = thirdColors[index];
        const isSelectedWedge = selectedWedgeIndex === index;
        const path = buildSectorPathByRadii({ rIn, rOut }, a0, a1);
        const bounds = getSectorBounds(rOut, a0, a1);
        const clipId = `${clipIdPrefix}-${ring}-${index}`;
        const title = `${ring} · wedge ${number} — click to cycle color`;

        return (
          <g key={`${ring}-${number}`}>
            <defs>
              <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                <path d={path} />
              </clipPath>
            </defs>
            <path
              d={path}
              fill={resolveFill(color, fallbackForIndex(index))}
              stroke="var(--board-stroke)"
              strokeWidth={1}
              pointerEvents="none"
              style={{
                transition: "fill 120ms, stroke 120ms",
                opacity: isSelectedWedge ? 1 : 0.96,
              }}
            >
              <title>{title}</title>
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
            <foreignObject
              x={bounds.x}
              y={bounds.y}
              width={bounds.width}
              height={bounds.height}
              clipPath={`url(#${clipId})`}
            >
              <button
                type="button"
                aria-label={`${ring} wedge ${number}`}
                title={title}
                onClick={() => onCycleWedge(ring, index)}
                className="h-full w-full cursor-pointer border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              />
            </foreignObject>
          </g>
        );
      })}
    </g>
  );
}

import { WEDGE_ORDER } from "./types";
import { buildAreaPathByKind, getNumberLabelRadius, polarToCartesian } from "./dartboardGeometry";

const NUMBER_LABEL_STYLE = { letterSpacing: "0.5px" } as const;

type Props = {
  startBase: number;
  wedgeAngle: number;
};

export function DartboardNumberRingBackground({ startBase, wedgeAngle }: Props) {
  return (
    <>
      {WEDGE_ORDER.map((_number, index) => {
        const a0 = startBase + index * wedgeAngle;
        const a1 = a0 + wedgeAngle;
        const fill = index % 2 === 0 ? "oklch(0.18 0.015 260)" : "oklch(0.28 0.02 260)";
        return (
          <path
            key={`num-bg-${index}`}
            d={buildAreaPathByKind("numberRing", a0, a1)}
            fill={fill}
            stroke="rgba(0,0,0,0.5)"
            strokeWidth={0.8}
          />
        );
      })}

      {WEDGE_ORDER.map((number, index) => {
        const a = startBase + (index + 0.5) * wedgeAngle;
        const [x, y] = polarToCartesian(getNumberLabelRadius(), a);
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
            style={NUMBER_LABEL_STYLE}
          >
            {number}
          </text>
        );
      })}
    </>
  );
}

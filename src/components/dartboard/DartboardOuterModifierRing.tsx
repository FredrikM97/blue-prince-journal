import { useId } from "react";
import type { getSectorBounds } from "./dartboardGeometry";

export type OuterModifierWedgeViewModel = {
  index: number;
  wedgeNumber: number;
  path: string;
  bounds: ReturnType<typeof getSectorBounds>;
  labelX: number;
  labelY: number;
  title: string;
  glyph: string | null;
  fill: string;
  stroke: string;
  strokeWidth: number;
  isSelected: boolean;
  isActive: boolean;
};

type Props = {
  wedges: OuterModifierWedgeViewModel[];
  onSelectWedge: (wedgeIndex: number) => void;
};

export function DartboardOuterModifierRing({ wedges, onSelectWedge }: Props) {
  const clipIdPrefix = useId().replaceAll(":", "");

  return (
    <g>
      {wedges.map((wedge) => (
        <g key={`outer-modifier-${wedge.index}`}>
          <defs>
            <clipPath id={`${clipIdPrefix}-outer-${wedge.index}`} clipPathUnits="userSpaceOnUse">
              <path d={wedge.path} />
            </clipPath>
          </defs>
          <path
            d={wedge.path}
            fill={wedge.fill}
            stroke={wedge.stroke}
            strokeWidth={wedge.strokeWidth}
            pointerEvents="none"
            style={{ transition: "fill 120ms, stroke 120ms" }}
          >
            <title>{wedge.title}</title>
          </path>
          {wedge.glyph ? (
            <text
              x={wedge.labelX}
              y={wedge.labelY + 3}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              fill="white"
              pointerEvents="none"
              style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.8))" }}
            >
              {wedge.glyph}
            </text>
          ) : null}
          <foreignObject
            x={wedge.bounds.x}
            y={wedge.bounds.y}
            width={wedge.bounds.width}
            height={wedge.bounds.height}
            clipPath={`url(#${clipIdPrefix}-outer-${wedge.index})`}
          >
            <button
              type="button"
              aria-label={`outer modifier wedge ${wedge.wedgeNumber}`}
              title={wedge.title}
              onClick={() => onSelectWedge(wedge.index)}
              className="h-full w-full cursor-pointer border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            />
          </foreignObject>
        </g>
      ))}
    </g>
  );
}

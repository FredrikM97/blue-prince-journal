export type OuterModifierWedgeViewModel = {
  index: number;
  wedgeNumber: number;
  path: string;
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
  return (
    <g>
      {wedges.map((wedge) => (
        <g key={`outer-modifier-${wedge.index}`}>
          <path
            aria-label={`outer modifier wedge ${wedge.wedgeNumber}`}
            d={wedge.path}
            fill={wedge.fill}
            stroke={wedge.stroke}
            strokeWidth={wedge.strokeWidth}
            onClick={() => {
              onSelectWedge(wedge.index);
            }}
            style={{
              cursor: "pointer",
              transition: "fill 120ms, stroke 120ms",
            }}
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
        </g>
      ))}
    </g>
  );
}

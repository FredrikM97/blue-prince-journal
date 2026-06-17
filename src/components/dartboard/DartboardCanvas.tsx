import { OPERATORS, WEDGE_ORDER, type BoardState, type OpColor, type RingKey } from "./types";
import type { SelectedTarget } from "./dartboardState";
import {
  DartboardOuterModifierRing,
} from "./DartboardOuterModifierRing";
import { DartboardNumberRingBackground } from "./DartboardNumberRingBackground";
import { DartboardCenterZone } from "./DartboardCenterZone";
import { getBoardAreas } from "./boardAreas";
import { renderBoardArea } from "./boardAreaRenderRegistry";
import { selectOuterModifierWedges } from "./selectOuterModifierWedges";
import {
  getBoardCenter,
  getBoardFrameGeometry,
} from "./dartboardGeometry";

type Props = {
  board: BoardState;
  advanced: boolean;
  selection: SelectedTarget;
  outerModifierAssignments: (string | null)[];
  outerModifierColors: (OpColor | null)[];
  bullseyeModifierGlyph: string | null;
  centerModifierGlyph: string | null;
  centerModifierColor: OpColor | null;
  bullseyeModifierColor: OpColor | null;
  onSelectZone: (zone: SelectedTarget) => void;
  onCycleWedge: (ring: RingKey, idx: number) => void;
};

// Keep stable style objects outside render to avoid recreating identical inline style objects.
const BOARD_SVG_STYLE = { filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.55))" } as const;

function selectCanvasAngles() {
  const wedgeCount = WEDGE_ORDER.length;
  const wedgeAngle = (2 * Math.PI) / wedgeCount;
  const startBase = -Math.PI / 2 - wedgeAngle / 2;
  return {
    wedgeAngle,
    startBase,
  } as const;
}

function resolveFill(color: OpColor | null, fallback: string) {
  return color ? OPERATORS[color].swatch : fallback;
}

function selectAreaFallbackByRing() {
  return {
    outer: (index: number) => (index % 2 === 0 ? "var(--board-red)" : "var(--board-green)"),
    middle: (index: number) => (index % 2 === 0 ? "var(--board-cream)" : "var(--board-black)"),
    triple: (index: number) => (index % 2 === 0 ? "var(--board-red)" : "var(--board-green)"),
    inner: (index: number) => (index % 2 === 0 ? "var(--board-cream)" : "var(--board-black)"),
  } satisfies Record<RingKey, (index: number) => string>;
}

function selectOuterModifierRingWedges(args: {
  outerModifierAssignments: (string | null)[];
  selection: SelectedTarget;
  startBase: number;
  wedgeAngle: number;
  outerModifierColors: (OpColor | null)[];
}) {
  return selectOuterModifierWedges({
    outerModifierAssignments: args.outerModifierAssignments,
    selection: args.selection,
    startBase: args.startBase,
    wedgeAngle: args.wedgeAngle,
    operatorSwatches: args.outerModifierColors.map((color) => (color ? OPERATORS[color].swatch : null)),
  });
}

function selectCenterZoneProps(args: {
  selection: SelectedTarget;
  centerModifierGlyph: string | null;
  bullseyeModifierGlyph: string | null;
  centerModifierColor: OpColor | null;
  bullseyeModifierColor: OpColor | null;
  onSelectZone: (zone: SelectedTarget) => void;
}): Parameters<typeof DartboardCenterZone>[0] {
  const {
    selection,
    centerModifierGlyph,
    bullseyeModifierGlyph,
    onSelectZone,
  } = args;

  const centerSelected = selection.zone === "center";
  const bullseyeSelected = selection.zone === "bullseye";

  return {
    centerSelected,
    bullseyeSelected,
    centerModifierGlyph,
    bullseyeModifierGlyph,
    centerModifierColor: args.centerModifierColor,
    bullseyeModifierColor: args.bullseyeModifierColor,
    onSelectCenter: () => onSelectZone({ zone: "center", wedgeIndex: null }),
    onSelectBullseye: () => onSelectZone({ zone: "bullseye", wedgeIndex: null }),
  };
}

export function DartboardCanvas({
  board,
  advanced,
  selection,
  outerModifierAssignments,
  outerModifierColors,
  bullseyeModifierGlyph,
  centerModifierGlyph,
  centerModifierColor,
  bullseyeModifierColor,
  onSelectZone,
  onCycleWedge,
}: Props) {
  const boardFrame = getBoardFrameGeometry();
  const boardCenter = getBoardCenter();
  const { wedgeAngle, startBase } = selectCanvasAngles();
  const areaFallbackByRing = selectAreaFallbackByRing();

  const outerModifierWedges = selectOuterModifierRingWedges({
    outerModifierAssignments,
    selection,
    startBase,
    wedgeAngle,
    outerModifierColors,
  });
  const centerZoneProps = selectCenterZoneProps({
    selection,
    centerModifierGlyph,
    bullseyeModifierGlyph,
    centerModifierColor,
    bullseyeModifierColor,
    onSelectZone,
  });

  return (
    <div className="relative flex h-full w-full min-h-0 items-center justify-center">
      <div className="relative aspect-square w-full max-w-[480px] sm:h-full sm:w-auto sm:max-w-full sm:max-h-full">
      <svg
        viewBox={`${-boardFrame.viewboxPadding} ${-boardFrame.viewboxPadding} ${boardFrame.boardSize + boardFrame.viewboxPadding * 2} ${boardFrame.boardSize + boardFrame.viewboxPadding * 2}`}
        className="block h-full w-full select-none"
        style={BOARD_SVG_STYLE}
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

        <circle cx={boardCenter.x} cy={boardCenter.y} r={boardFrame.outerRadius} fill="url(#cabinet-grad)" />

        {advanced ? (
          <DartboardOuterModifierRing
            wedges={outerModifierWedges}
            onSelectWedge={(wedgeIndex) => {
              onSelectZone({ zone: "outerModifier", wedgeIndex });
            }}
          />
        ) : null}

        <DartboardNumberRingBackground startBase={startBase} wedgeAngle={wedgeAngle} />

        {getBoardAreas().map((area) => {
          return renderBoardArea({
            area,
            board,
            selection,
            wedgeAngle,
            startBase,
            onCycleWedge,
            resolveFill,
            fallbackByRing: areaFallbackByRing,
          });
        })}

        <DartboardCenterZone {...centerZoneProps} />

        <circle cx={boardCenter.x} cy={boardCenter.y} r={boardFrame.outerRadius} fill="url(#shade)" pointerEvents="none" />
      </svg>
      </div>
    </div>
  );
}
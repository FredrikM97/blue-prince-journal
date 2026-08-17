import { useMemo, useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageLayout } from "@/components/common/PageLayout";
import { ResultPanel } from "./ResultPanel";
import { compute } from "./compute";
import { DartboardCanvas } from "./DartboardCanvas";
import { DartboardColorToolPalette } from "./DartboardColorToolPalette";
import { DartboardPaintModeRow } from "./DartboardPaintModeRow";
import { ModifierPanel } from "./ModifierPanel";
import { MODIFIER_PRESETS } from "./modifiers";
import {
  applyClearSelection,
  applyPaintSelection,
  createBoardSelectionTarget,
  DEFAULT_SELECTED_TARGET,
  type PaintMode,
  type SelectedTarget,
} from "./dartboardState";
import {
  OPERATORS,
  WEDGE_COUNT,
  emptyBoard,
  emptyModifierState,
  type BoardState,
  type ModifierState,
  type ModifierZone,
  type OpColor,
  type RingKey,
} from "./types";

export function DartboardPage() {
  const [board, setBoard] = useState<BoardState>(() => emptyBoard());
  const [advanced, setAdvanced] = useState(false);
  const [selection, setSelection] = useState<SelectedTarget>(DEFAULT_SELECTED_TARGET);
  const [paintMode, setPaintMode] = useState<PaintMode>("filled");
  const [activeColor, setActiveColor] = useState<OpColor | null>(null);
  const [clearMode, setClearMode] = useState(false);
  const [modifierHintVisible, setModifierHintVisible] = useState(false);
  const [activeModifierZone, setActiveModifierZone] = useState<ModifierZone>("outer");
  const [activeOuterModifierId, setActiveOuterModifierId] = useState<string | null>(null);
  const [outerModifierColorByWedge, setOuterModifierColorByWedge] = useState<(OpColor | null)[]>(
    () => Array(WEDGE_COUNT).fill(null),
  );
  const [modifierColorByZone, setModifierColorByZone] = useState<Record<ModifierZone, OpColor | null>>({
    center: null,
    bullseye: null,
    outer: null,
  });
  const [modifiers, setModifiers] = useState<ModifierState>(() => emptyModifierState());

  const resultState = useMemo(() => compute(board, { advanced, modifiers }), [advanced, board, modifiers]);
  const hasActiveColor = activeColor !== null;
  const activeBullseyeModifierGlyph = useMemo(() => {
    const activeId = [...modifiers.bullseye][0];
    if (!activeId) return null;
    const activeModifier = MODIFIER_PRESETS.bullseye.find((item) => item.id === activeId);
    return activeModifier?.glyph ?? null;
  }, [modifiers.bullseye]);
  const activeCenterModifierGlyph = useMemo(() => {
    const activeId = [...modifiers.center][0];
    if (!activeId) return null;
    const activeModifier = MODIFIER_PRESETS.center.find((item) => item.id === activeId);
    return activeModifier?.glyph ?? null;
  }, [modifiers.center]);

  function handleCycleWedge(ring: RingKey, index: number) {
    setSelection(createBoardSelectionTarget(ring, index));
    setBoard((currentBoard) => {
      const target = createBoardSelectionTarget(ring, index);
      if (clearMode) {
        return applyClearSelection(currentBoard, target, paintMode, advanced);
      }
      return applyPaintSelection(currentBoard, target, activeColor, paintMode, advanced);
    });
  }

  function handlePaintColor(color: OpColor) {
    setActiveColor(color);
    setClearMode(false);
    setModifierHintVisible(false);
  }

  function handleSelectZone(zone: SelectedTarget) {
    setSelection(zone);

    if (zone.zone !== "outerModifier" || zone.wedgeIndex === null || !activeOuterModifierId) return;

    const wedgeIndex = zone.wedgeIndex;
    setModifiers((currentModifiers) => {
      const nextOuter = [...currentModifiers.outer];
      const shouldClear = nextOuter[wedgeIndex] === activeOuterModifierId;
      nextOuter[wedgeIndex] = shouldClear ? null : activeOuterModifierId;

      setOuterModifierColorByWedge((currentColors) => {
        const nextColors = [...currentColors];
        nextColors[wedgeIndex] = shouldClear ? null : modifierColorByZone.outer;
        return nextColors;
      });

      return {
        ...currentModifiers,
        outer: nextOuter,
      };
    });
  }

  function handleSelectClearTool() {
    setActiveColor(null);
    setClearMode(true);
  }

  function handleToggleModifier(zone: ModifierZone, id: string) {
    if (!activeColor) {
      setModifierHintVisible(true);
      return;
    }

    setModifierHintVisible(false);

    if (zone === "outer") {
      setActiveOuterModifierId((current) => (current === id ? null : id));
      setModifierColorByZone((current) => ({
        ...current,
        outer: activeColor,
      }));
      return;
    }

    setModifiers((currentModifiers) => {
      const nextZoneModifiers = new Set<string>();
      if (currentModifiers[zone].has(id)) {
        nextZoneModifiers.delete(id);
      } else {
        nextZoneModifiers.add(id);
      }
      return {
        ...currentModifiers,
        [zone]: nextZoneModifiers,
      };
    });

    setModifierColorByZone((current) => ({
      ...current,
      [zone]: activeColor,
    }));
  }


  function getModifierPanelState(zone: ModifierZone) {
    if (zone === "outer") {
      return {
        title: "Outer modifiers",
        subtitle: "Select an outer modifier, then click an outer ring slot to place it.",
        active: new Set(activeOuterModifierId ? [activeOuterModifierId] : []),
        accentSwatch: modifierColorByZone.outer ? OPERATORS[modifierColorByZone.outer].swatch : null,
      };
    }
    if (zone === "center") {
      return {
        title: "Inner modifiers",
        subtitle: "At most one inner modifier can be active.",
        active: modifiers.center,
        accentSwatch: modifierColorByZone.center ? OPERATORS[modifierColorByZone.center].swatch : null,
      };
    }
    return {
      title: "Bullseye modifiers",
      subtitle: "At most one inner-center modifier can be active.",
      active: modifiers.bullseye,
      accentSwatch: modifierColorByZone.bullseye ? OPERATORS[modifierColorByZone.bullseye].swatch : null,
    };
  }

  const activeModifierPanel = getModifierPanelState(activeModifierZone);

  return (
    <PageLayout
      variant="panel"
      className="items-stretch gap-4"
      mobilePanelLabels={{ left: "Board", right: "Controls" }}
    >
      <PageLayout.Middle>
        <div className="flex h-auto min-h-0 flex-col gap-4 sm:h-full">
          <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-amber-300/45 bg-card/40 p-2 sm:p-4">
            <DartboardCanvas
              board={board}
              advanced={advanced}
              selection={selection}
              outerModifierAssignments={modifiers.outer}
              outerModifierColors={outerModifierColorByWedge}
              bullseyeModifierGlyph={activeBullseyeModifierGlyph}
              centerModifierGlyph={activeCenterModifierGlyph}
              centerModifierColor={modifierColorByZone.center}
              bullseyeModifierColor={modifierColorByZone.bullseye}
              onSelectZone={handleSelectZone}
              onCycleWedge={handleCycleWedge}
            />
          </div>

          <ResultPanel result={resultState.result} error={resultState.error} />
        </div>
      </PageLayout.Middle>

      <PageLayout.Right>
        <div className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto px-0 py-2 text-[16px] pb-4 divide-y divide-border/30 sm:px-4 sm:py-4 sm:text-base sm:pb-6">
          <div className="pb-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg text-foreground">Controls</h2>
                <p className="text-xs text-muted-foreground">Select a zone, then paint it with an operator.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                active={advanced}
                onClick={() => setAdvanced((current) => !current)}
                title="Toggle advanced mode"
                className="h-7 w-7 p-0"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <DartboardColorToolPalette
                activeColor={activeColor}
                clearMode={clearMode}
                onSelectClearTool={handleSelectClearTool}
                onSelectColor={handlePaintColor}
              />

              <DartboardPaintModeRow paintMode={paintMode} onSelectMode={setPaintMode} />

            </div>
          </div>

          <div className="pt-4">
            <div className="mb-2 text-[12px] uppercase tracking-wider text-muted-foreground">Modifiers</div>
            {modifierHintVisible && !hasActiveColor ? (
              <div className="mb-2 rounded-md border border-amber-400/30 bg-amber-300/10 px-3 py-2 text-[12px] text-amber-200 sm:text-[11px]">
                Select a color first, then use these tabs to place modifiers.
              </div>
            ) : null}
            <div className="grid grid-cols-3 gap-1 rounded-t-xl border border-border/40 border-b-0 bg-muted/20 p-1 pb-0.5 shadow-[inset_0_-1px_0_0_var(--color-border)]">
              {([
                { zone: "bullseye", label: "Bullseye" },
                { zone: "center", label: "Inner" },
                { zone: "outer", label: "Outer" },
              ] as const).map((option) => (
                <Button
                  key={option.zone}
                  variant={activeModifierZone === option.zone ? "outline" : "ghost"}
                  size="sm"
                  active={activeModifierZone === option.zone}
                  className={activeModifierZone === option.zone
                    ? "relative -mb-px h-11 rounded-b-none border-border border-b-background bg-background px-4 text-[14px] font-semibold text-foreground shadow-sm before:absolute before:inset-x-3 before:bottom-0 before:h-0.5 before:rounded-full before:bg-brass sm:h-8 sm:px-2 sm:text-[10px]"
                    : "relative -mb-px h-11 rounded-b-none border border-transparent border-b-0 bg-transparent px-4 text-[14px] text-muted-foreground hover:border-border/70 hover:bg-background/65 hover:text-foreground sm:h-8 sm:px-2 sm:text-[10px]"
                  }
                  onClick={() => setActiveModifierZone(option.zone)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            <div className="-mt-px rounded-b-xl border border-border/40 border-t-0 bg-background/10 px-1 pb-1 pt-3 shadow-[inset_0_1px_0_0_var(--color-border)]">
              <ModifierPanel
                zone={activeModifierZone}
                title={activeModifierPanel.title}
                subtitle={activeModifierPanel.subtitle}
                active={activeModifierPanel.active}
                onToggle={(id) => handleToggleModifier(activeModifierZone, id)}
                accentSwatch={activeModifierPanel.accentSwatch}
                disabled={!hasActiveColor}
                onBlockedAttempt={() => setModifierHintVisible(true)}
                compact
                singleSelect
              />
            </div>
          </div>
        </div>
      </PageLayout.Right>
    </PageLayout>
  );
}

import { useMemo, useState } from "react";
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
    if (!activeColor) return;

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

  function handleClearBoard() {
    setBoard(emptyBoard());
    setModifiers(emptyModifierState());
    setSelection(DEFAULT_SELECTED_TARGET);
    setActiveOuterModifierId(null);
    setOuterModifierColorByWedge(Array(WEDGE_COUNT).fill(null));
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
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div className="relative flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-amber-300/45 bg-card/40 p-4">
            <div className="pointer-events-none absolute left-3 top-3 rounded border border-amber-300/60 bg-amber-200/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">
              WIP
            </div>
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
        <div className="flex h-full min-h-0 flex-col gap-4 overflow-hidden p-4 pb-6">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg text-foreground">Controls</h2>
                <p className="text-xs text-muted-foreground">Select a zone, then paint it with an operator.</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-7 px-2 text-[10px]" onClick={handleClearBoard}>
                  Clear dartboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  active={advanced}
                  surface="mobile-toggle"
                  onClick={() => setAdvanced((current) => !current)}
                >
                  Advanced
                </Button>
              </div>
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

          <div className="min-h-0 flex-1 overflow-y-auto pr-1">
            <div className="sticky top-0 z-10 rounded-xl border border-border bg-card/95 p-2 shadow-sm backdrop-blur-sm">
              <div className="mb-2 grid grid-cols-3 gap-1">
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
                      ? "h-7 border-border bg-background px-2 text-[10px] font-semibold text-foreground"
                      : "h-7 border border-transparent px-2 text-[10px] text-muted-foreground hover:border-border/70 hover:text-foreground"
                    }
                    onClick={() => setActiveModifierZone(option.zone)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>

              <ModifierPanel
                zone={activeModifierZone}
                title={activeModifierPanel.title}
                subtitle={activeModifierPanel.subtitle}
                active={activeModifierPanel.active}
                onToggle={(id) => handleToggleModifier(activeModifierZone, id)}
                accentSwatch={activeModifierPanel.accentSwatch}
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

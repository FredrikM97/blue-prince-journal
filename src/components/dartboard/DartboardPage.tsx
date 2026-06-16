import { useMemo, useState } from "react";
import { Button } from "@/components/common/Button";
import { PageLayout } from "@/components/common/PageLayout";
import { ResultPanel } from "./ResultPanel";
import { compute } from "./compute";
import { DartboardBoard } from "./DartboardBoard";
import { ModifierPanel } from "./ModifierPanel";
import { MODIFIER_PRESETS } from "./modifiers";
import {
  applyClearSelection,
  applyPaintSelection,
  createBoardSelectionTarget,
  DEFAULT_SELECTED_TARGET,
  PAINT_MODE_OPTIONS,
  type PaintMode,
  type SelectedTarget,
} from "./dartboardState";
import {
  OPERATORS,
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
  const [activeOuterModifierId, setActiveOuterModifierId] = useState<string | null>(null);
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
    if (!activeId || activeId === "none") return null;
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
      nextOuter[wedgeIndex] = nextOuter[wedgeIndex] === activeOuterModifierId ? null : activeOuterModifierId;
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
        if (id === "none") {
          nextZoneModifiers.clear();
        } else {
          nextZoneModifiers.delete("none");
        }
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
  }

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
            <DartboardBoard
              board={board}
              advanced={advanced}
              selection={selection}
              outerModifierAssignments={modifiers.outer}
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
        <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto p-4">
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
              <div>
                <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Select color</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSelectClearTool}
                    title="Clear tool"
                    aria-label="Clear tool"
                    aria-pressed={clearMode}
                    className={`inline-flex h-18 w-16 flex-col items-center justify-center gap-1.5 rounded-md border text-base font-semibold transition-colors ${
                      clearMode
                        ? "border-accent bg-accent/20 text-foreground ring-2 ring-accent ring-offset-1 ring-offset-background"
                        : "border-border bg-background/40 text-muted-foreground hover:border-accent/50 hover:text-foreground"
                    }`}
                    style={
                      clearMode
                        ? {
                            boxShadow:
                              "0 0 0 1px var(--accent) inset, 0 0 16px color-mix(in oklab, var(--accent) 55%, transparent)",
                          }
                        : undefined
                    }
                  >
                    <span className="inline-block h-5 w-5 rounded-full border border-black/30 bg-transparent" />
                    <span className="leading-none text-foreground">Clear</span>
                  </button>
                  {(Object.keys(OPERATORS) as OpColor[]).map((color) => {
                    const operator = OPERATORS[color];
                    const isActive = activeColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => handlePaintColor(color)}
                        title={operator.label}
                        aria-label={`${operator.label} operator`}
                        aria-pressed={isActive}
                        aria-current={isActive ? "true" : undefined}
                        className={`relative inline-flex h-18 w-16 flex-col items-center justify-center gap-1.5 rounded-md border text-base font-semibold transition-colors ${
                          isActive
                            ? "border-[3px] border-foreground bg-accent/20 text-foreground ring-4 ring-foreground/50 ring-offset-2 ring-offset-background"
                            : "border-border bg-background/40 text-muted-foreground hover:border-accent/50 hover:text-foreground"
                        }`}
                        style={
                          isActive
                            ? {
                                boxShadow:
                                  "0 0 0 2px var(--foreground) inset, 0 0 20px color-mix(in oklab, var(--foreground) 35%, transparent)",
                                background: `color-mix(in oklab, ${operator.swatch} 26%, var(--background))`,
                                transform: "translateY(-1px)",
                              }
                            : { background: `color-mix(in oklab, ${operator.swatch} 18%, var(--background))` }
                        }
                      >
                        <span
                          className="inline-block h-5 w-5 rounded-full border border-black/30"
                          style={{ background: operator.swatch }}
                        />
                        <span className="leading-none text-foreground">{operator.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Paint mode</div>
                <div className="flex flex-wrap gap-1.5">
                  {PAINT_MODE_OPTIONS.map((mode) => (
                    <Button
                      key={mode.value}
                      variant={paintMode === mode.value ? "brass" : "outline"}
                      size="sm"
                      onClick={() => setPaintMode(mode.value)}
                      className="h-7 px-2 text-[10px]"
                      title={mode.note}
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          <ModifierPanel
            zone="bullseye"
            title="Bullseye modifiers"
            subtitle="At most one inner-center modifier can be active."
            active={modifiers.bullseye}
            onToggle={(id) => handleToggleModifier("bullseye", id)}
            accentSwatch={
              modifierColorByZone.bullseye ? OPERATORS[modifierColorByZone.bullseye].swatch : null
            }
            compact
            singleSelect
            collapsible
          />

          <ModifierPanel
            zone="center"
            title="Inner modifiers"
            subtitle="At most one inner modifier can be active."
            active={modifiers.center}
            onToggle={(id) => handleToggleModifier("center", id)}
            accentSwatch={modifierColorByZone.center ? OPERATORS[modifierColorByZone.center].swatch : null}
            compact
            singleSelect
            collapsible
          />

          <ModifierPanel
            zone="outer"
            title="Outer modifiers"
            subtitle="Select an outer modifier, then click an outer ring slot to place it."
            active={new Set(activeOuterModifierId ? [activeOuterModifierId] : [])}
            onToggle={(id) => handleToggleModifier("outer", id)}
            accentSwatch={modifierColorByZone.outer ? OPERATORS[modifierColorByZone.outer].swatch : null}
            compact
            singleSelect
            collapsible
          />
        </div>
      </PageLayout.Right>
    </PageLayout>
  );
}

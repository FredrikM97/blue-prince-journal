import { useMemo, useState } from "react";
import { CircleHelp, Settings } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageLayout } from "@/components/common/PageLayout";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import { toast } from "sonner";
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
  const [modifierGuideOpen, setModifierGuideOpen] = useState(false);
  const [modifierGuideZone, setModifierGuideZone] = useState<ModifierZone>("outer");
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

  function showModifierHintToast() {
    toast("Pick a color first", {
      description: "Select a color in the Select color section before choosing modifiers.",
    });
  }


  function getModifierPanelState(zone: ModifierZone) {
    if (zone === "outer") {
      return {
        active: new Set(activeOuterModifierId ? [activeOuterModifierId] : []),
        accentSwatch: modifierColorByZone.outer ? OPERATORS[modifierColorByZone.outer].swatch : null,
      };
    }
    if (zone === "center") {
      return {
        active: modifiers.center,
        accentSwatch: modifierColorByZone.center ? OPERATORS[modifierColorByZone.center].swatch : null,
      };
    }
    return {
      active: modifiers.bullseye,
      accentSwatch: modifierColorByZone.bullseye ? OPERATORS[modifierColorByZone.bullseye].swatch : null,
    };
  }

  const activeModifierPanel = getModifierPanelState(activeModifierZone);
  const activeModifierGuideItems = MODIFIER_PRESETS[modifierGuideZone];
  const activeModifierGuideTitle =
    modifierGuideZone === "outer"
      ? "Outer"
      : modifierGuideZone === "center"
        ? "Inner"
        : "Bullseye";

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
        <div className="flex h-full min-h-0 flex-col gap-0 overflow-y-auto px-0 py-2 text-[16px] pb-4 divide-y divide-border/30 sm:px-4 sm:py-4 sm:text-base sm:pb-6">
          <div className="pb-3">
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

          <div className="pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[13px] font-semibold uppercase tracking-wide text-foreground/90">Modifiers</div>
              <Button
                variant="ghost"
                size="icon-h2"
                onClick={() => {
                  setModifierGuideZone(activeModifierZone);
                  setModifierGuideOpen(true);
                }}
                title="What do these modifiers do?"
                aria-label="Open modifier guide"
                className="rounded-full"
              >
                <CircleHelp className="h-4 w-4" />
              </Button>
            </div>
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
                    ? "relative -mb-px h-11 rounded-b-none border-border border-b-background bg-background px-4 text-[14px] font-semibold text-foreground shadow-sm before:absolute before:inset-x-3 before:bottom-0 before:h-0.5 before:rounded-full before:bg-brass"
                    : "relative -mb-px h-11 rounded-b-none border border-transparent border-b-0 bg-transparent px-4 text-[14px] text-foreground/80 hover:border-border/70 hover:bg-background/65 hover:text-foreground"
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
                active={activeModifierPanel.active}
                onToggle={(id) => handleToggleModifier(activeModifierZone, id)}
                onBlockedAttempt={showModifierHintToast}
                accentSwatch={activeModifierPanel.accentSwatch}
                disabled={!hasActiveColor}
                compact
              />
            </div>
          </div>
        </div>

        <Dialog open={modifierGuideOpen} onOpenChange={setModifierGuideOpen}>
          <DialogContent variant="expand">
            <DialogHeader>
              <DialogTitle>{activeModifierGuideTitle} modifier guide</DialogTitle>
              <DialogDescription>
                Each modifier changes the current value after an operation.
              </DialogDescription>
            </DialogHeader>
            <div className="dialog-scroll-body space-y-4 pr-1">
              <section className="rounded-md border border-border/60 bg-background/60 px-3 py-3">
                <h4 className="text-sm font-semibold text-foreground">What the zones mean</h4>
                <ul className="mt-2 space-y-1 text-sm text-foreground/90">
                  <li>
                    <span className="font-semibold">Bullseye:</span> center-most modifier slot.
                  </li>
                  <li>
                    <span className="font-semibold">Inner:</span> modifier applied in the inner ring.
                  </li>
                  <li>
                    <span className="font-semibold">Outer:</span> assign a modifier, then tap outer ring wedges
                    on the board to place/remove it.
                  </li>
                </ul>
              </section>

              <section>
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground/75">
                  Select modifiers
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-t-xl border border-border/60 border-b-0 bg-muted/20 p-1 pb-0.5 shadow-[inset_0_-1px_0_0_var(--color-border)]">
                  {([
                    { zone: "bullseye", label: "Bullseye" },
                    { zone: "center", label: "Inner" },
                    { zone: "outer", label: "Outer" },
                  ] as const).map((option) => (
                    <Button
                      key={option.zone}
                      variant={modifierGuideZone === option.zone ? "outline" : "ghost"}
                      size="sm"
                      className={modifierGuideZone === option.zone
                        ? "relative -mb-px h-9 rounded-b-none border-border border-b-background bg-background px-3 text-[12px] font-semibold text-foreground shadow-sm before:absolute before:inset-x-3 before:bottom-0 before:h-0.5 before:rounded-full before:bg-brass"
                        : "relative -mb-px h-9 rounded-b-none border border-transparent border-b-0 bg-transparent px-3 text-[12px] text-foreground/75 hover:border-border/60 hover:bg-background/60 hover:text-foreground"
                      }
                      onClick={() => setModifierGuideZone(option.zone)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
                <div className="-mt-px rounded-b-xl border border-border/60 border-t-0 bg-background/40 px-3 pb-3 pt-2 shadow-[inset_0_1px_0_0_var(--color-border)]">
                  <div className="space-y-2">
                  {activeModifierGuideItems.map((modifier) => (
                    <div
                      key={modifier.id}
                      className="rounded-md border border-border/60 bg-background/60 px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-foreground">{modifier.glyph}</span>
                        <span className="text-sm font-semibold text-foreground">{modifier.label}</span>
                      </div>
                      <p className="mt-1 text-sm text-foreground/85">{modifier.note}</p>
                    </div>
                  ))}
                  </div>
                </div>
              </section>
            </div>
          </DialogContent>
        </Dialog>
      </PageLayout.Right>
    </PageLayout>
  );
}

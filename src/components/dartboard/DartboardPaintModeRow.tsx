import { Button } from "@/components/common/Button";
import { PAINT_MODE_OPTIONS, type PaintMode } from "./dartboardState";

type Props = {
  paintMode: PaintMode;
  onSelectMode: (mode: PaintMode) => void;
};

export function DartboardPaintModeRow({ paintMode, onSelectMode }: Props) {
  return (
    <div>
      <div className="mb-2 text-[11px] uppercase tracking-wider text-muted-foreground">Paint mode</div>
      <div className="flex flex-wrap gap-1.5">
        {PAINT_MODE_OPTIONS.map((mode) => (
          <Button
            key={mode.value}
            variant={paintMode === mode.value ? "brass" : "outline"}
            size="sm"
            onClick={() => onSelectMode(mode.value)}
            className="h-7 px-2 text-[10px]"
            title={mode.note}
          >
            {mode.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

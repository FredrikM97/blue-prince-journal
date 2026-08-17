import { Eraser } from "lucide-react";
import { OPERATORS, type OpColor } from "./types";

type Props = {
  activeColor: OpColor | null;
  clearMode: boolean;
  onSelectClearTool: () => void;
  onSelectColor: (color: OpColor) => void;
};

export function DartboardColorToolPalette({
  activeColor,
  clearMode,
  onSelectClearTool,
  onSelectColor,
}: Props) {
  return (
    <div>
      <div className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">Select color</div>
      <div className="flex flex-wrap gap-1 sm:gap-2">
        <button
          type="button"
          onClick={onSelectClearTool}
          title="Clear tool"
          aria-label="Clear tool"
          aria-pressed={clearMode}
          className={`inline-flex h-[3.75rem] w-[3.75rem] items-center justify-center rounded-md border transition-colors sm:h-[4.25rem] sm:w-[4.25rem] ${
            clearMode
              ? "border-accent bg-accent/20 text-foreground ring-2 ring-accent ring-offset-1 ring-offset-background"
              : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
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
          <Eraser className="h-6 w-6 sm:h-7 sm:w-7" />
        </button>
        {(Object.keys(OPERATORS) as OpColor[]).map((color) => {
          const operator = OPERATORS[color];
          const isActive = activeColor === color;
          return (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              title={operator.label}
              aria-label={`${operator.label} operator`}
              aria-pressed={isActive}
              aria-current={isActive ? "true" : undefined}
              className={`relative inline-flex h-[3.75rem] w-[3.75rem] flex-col items-center justify-center gap-0.5 rounded-md border text-sm font-semibold transition-colors sm:h-[4.25rem] sm:w-[4.25rem] sm:gap-1 sm:text-base ${
                isActive
                  ? "border-[3px] border-foreground bg-accent/20 text-foreground ring-4 ring-foreground/50 ring-offset-2 ring-offset-background"
                  : "border-border bg-card text-muted-foreground hover:border-accent/50 hover:text-foreground"
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
                className="inline-block h-6 w-6 rounded-full border border-black/30 sm:h-7 sm:w-7"
                style={{ background: operator.swatch }}
              />
              <span className="leading-none text-foreground">{operator.symbol}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

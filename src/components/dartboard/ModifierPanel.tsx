import { MODIFIER_PRESETS } from "./modifiers";
import type { ModifierZone } from "./types";

type Props = {
  zone: ModifierZone;
  active: Set<string>;
  onToggle: (id: string) => void;
  onBlockedAttempt?: () => void;
  accentSwatch?: string | null;
  disabled?: boolean;
  compact?: boolean;
};

export function ModifierPanel({
  zone,
  active,
  onToggle,
  onBlockedAttempt,
  accentSwatch = null,
  disabled = false,
  compact = false,
}: Props) {
  const items = MODIFIER_PRESETS[zone];

  return (
    <div className="rounded-xl p-1">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(3.25rem,1fr))] gap-1 sm:grid-cols-[repeat(auto-fit,minmax(4rem,1fr))]">
        {items.map((m) => {
          const isOn = active.has(m.id);
          return (
            <button
              type="button"
              key={m.id}
              title={`${m.label} — ${m.note}`}
              aria-pressed={isOn}
              aria-disabled={disabled}
              onClick={() => {
                if (disabled) {
                  onBlockedAttempt?.();
                  return;
                }
                onToggle(m.id);
              }}
              className={`group flex h-[3.75rem] min-h-0 w-full min-w-0 flex-col items-center justify-center gap-0.5 rounded-md border px-1 py-1 text-center transition-all sm:h-[4.25rem] md:h-[4.5rem] ${
                disabled
                  ? "cursor-not-allowed border-border/70 bg-background/55 text-foreground/95 opacity-100"
                  : isOn
                  ? "border-accent bg-accent/22 text-foreground"
                  : "border-border/80 bg-background/50 text-foreground hover:border-accent/70 hover:bg-background/70 hover:text-foreground"
              }`}
              style={
                isOn
                  ? {
                      boxShadow: accentSwatch
                        ? `0 0 0 1px ${accentSwatch} inset, 0 0 14px color-mix(in oklab, ${accentSwatch} 55%, transparent)`
                        : "0 0 0 1px var(--accent) inset, 0 0 14px color-mix(in oklab, var(--accent) 50%, transparent)",
                      background: accentSwatch
                        ? `color-mix(in oklab, ${accentSwatch} 28%, var(--background))`
                        : undefined,
                    }
                  : undefined
              }
            >
              <span
                className={`${compact ? "text-[20px] font-semibold sm:text-[21px]" : "font-serif text-lg"} leading-none text-foreground`}
              >
                {m.glyph}
              </span>
              <span
                className={`line-clamp-2 max-w-full leading-[1.1] text-foreground ${compact ? "px-0.5 text-[11px] font-semibold tracking-normal" : "text-[11px] font-semibold uppercase tracking-wide"}`}
              >
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useState } from "react";
import { MODIFIER_PRESETS } from "./modifiers";
import type { ModifierZone } from "./types";

type Props = {
  zone: ModifierZone;
  title: string;
  subtitle: string;
  active: Set<string>;
  onToggle: (id: string) => void;
  accentSwatch?: string | null;
  disabled?: boolean;
  onBlockedAttempt?: () => void;
  compact?: boolean;
  singleSelect?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
};

export function ModifierPanel({
  zone,
  title,
  subtitle,
  active,
  onToggle,
  accentSwatch = null,
  disabled = false,
  onBlockedAttempt,
  compact = false,
  singleSelect = false,
  collapsible = false,
  defaultCollapsed = false,
}: Props) {
  const items = MODIFIER_PRESETS[zone];
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="rounded-xl p-1">
      <div className="mb-3 flex items-baseline justify-between border-b border-border/20 pb-2">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-baseline justify-between gap-2 text-left disabled:cursor-not-allowed disabled:opacity-70"
          onClick={collapsible ? () => setCollapsed((current) => !current) : undefined}
          disabled={!collapsible || disabled}
        >
          <div>
            <h3 className="font-serif text-[18px] text-foreground sm:text-base">{title}</h3>
            <p className="text-[13px] text-muted-foreground sm:text-[11px]">{subtitle}</p>
          </div>
          <span className="text-[12px] uppercase tracking-wider text-muted-foreground sm:text-[10px]">
            {singleSelect ? `${active.size > 0 ? 1 : 0}/1` : `${active.size}/${items.length}`}
            {collapsible ? ` ${collapsed ? "+" : "-"}` : ""}
          </span>
        </button>
      </div>
      {disabled ? (
        <div className="mb-3 rounded-md border border-dashed border-border/50 bg-background/40 px-3 py-2 text-[12px] text-muted-foreground">
          Select a color first to enable modifier tabs.
        </div>
      ) : null}
      {collapsed ? null : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(3rem,1fr))] gap-1 sm:grid-cols-[repeat(auto-fit,minmax(3.75rem,1fr))]">
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
                className={`group flex h-[3rem] min-h-0 w-full min-w-0 flex-col items-center justify-center gap-0 rounded-md border px-0.5 py-0.5 text-center transition-all sm:h-[3.75rem] md:h-[4rem] ${
                  disabled
                    ? "cursor-not-allowed border-border/40 bg-background/20 text-muted-foreground opacity-60"
                    : isOn
                    ? "border-accent bg-accent/15 text-foreground"
                    : "border-border bg-background/40 text-muted-foreground hover:border-accent/50 hover:text-foreground"
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
                <span className={`${compact ? "text-[16px] sm:text-sm" : "font-serif text-sm"} leading-none`}>{m.glyph}</span>
                <span className={`line-clamp-2 leading-tight ${compact ? "text-[10px] sm:text-[8px]" : "text-[9px] uppercase tracking-wider"}`}>
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

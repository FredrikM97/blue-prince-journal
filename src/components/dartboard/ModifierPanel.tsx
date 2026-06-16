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
  compact = false,
  singleSelect = false,
  collapsible = false,
  defaultCollapsed = false,
}: Props) {
  const items = MODIFIER_PRESETS[zone];
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
      <div className="mb-3 flex items-baseline justify-between">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-baseline justify-between gap-2 text-left"
          onClick={collapsible ? () => setCollapsed((current) => !current) : undefined}
          disabled={!collapsible}
        >
          <div>
            <h3 className="font-serif text-base text-foreground">{title}</h3>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {singleSelect ? `${active.size > 0 ? 1 : 0}/1` : `${active.size}/${items.length}`}
            {collapsible ? ` ${collapsed ? "+" : "-"}` : ""}
          </span>
        </button>
      </div>
      {collapsed ? null : (
        <div className="flex flex-wrap justify-center gap-1">
          {items.map((m) => {
            const isOn = active.has(m.id);
            return (
              <button
                type="button"
                key={m.id}
                onClick={() => onToggle(m.id)}
                title={`${m.label} — ${m.note}`}
                aria-pressed={isOn}
                className={`group flex h-[5.25rem] w-[5.25rem] min-h-0 min-w-0 flex-col items-center justify-center gap-0 rounded-md border px-0.5 py-0.5 text-center transition-all ${
                  isOn
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
                <span className={`${compact ? "text-sm" : "font-serif text-sm"} leading-none`}>{m.glyph}</span>
                <span className={`line-clamp-2 leading-tight ${compact ? "text-[8px]" : "text-[9px] uppercase tracking-wider"}`}>
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

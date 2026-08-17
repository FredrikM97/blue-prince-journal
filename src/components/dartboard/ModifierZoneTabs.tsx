import type { ModifierZone } from "./types";

const ZONE_OPTIONS: { zone: ModifierZone; label: string }[] = [
  { zone: "bullseye", label: "Bullseye" },
  { zone: "center", label: "Inner" },
  { zone: "outer", label: "Outer" },
];

/** Matches the shared pill-tab pattern used by notes/todos (see Tabs.tsx). */
export function ModifierZoneTabs({
  value,
  onChange,
  size = "default",
}: {
  value: ModifierZone;
  onChange: (zone: ModifierZone) => void;
  size?: "default" | "compact";
}) {
  const listHeight = size === "compact" ? "h-8" : "h-9";
  const triggerText = size === "compact" ? "text-[11px]" : "text-xs";

  return (
    <div className={`grid ${listHeight} grid-cols-3 items-stretch justify-center rounded-md bg-muted p-0.5`}>
      {ZONE_OPTIONS.map((option) => {
        const isActive = value === option.zone;
        return (
          <button
            key={option.zone}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.zone)}
            className={`relative inline-flex h-full items-center justify-center whitespace-nowrap rounded-sm ${triggerText} font-semibold transition-all ${
              isActive
                ? "bg-background text-foreground shadow-sm ring-1 ring-border after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-brass"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/general/Stack";
import { MetaText } from "@/components/common/Typography";

type FilterSectionWidth = "fill" | "fit";

const CONTROL_WIDTH_CLASS_BY_VARIANT: Record<FilterSectionWidth, string> = {
  fill: "min-w-0 flex-1",
  fit: "w-auto",
};

export function FilterSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  width = "fill",
  variant = "compact",
  onReset,
  badge,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  width?: FilterSectionWidth;
  variant?: "default" | "compact";
  onReset?: () => void;
  badge?: string;
}) {
  void variant;
  const [open, setOpen] = useState(defaultOpen);
  const ChevronIcon = open ? ChevronDown : ChevronRight;
  const chevronIconClassName = "h-2.5 w-2.5";
  const headerClassName =
    "flex items-center justify-between text-[11px] font-medium uppercase tracking-wide text-muted-foreground";
  const controlButtonClassName = [
    "flex min-h-6 cursor-pointer select-none items-center justify-between gap-1 px-1 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    CONTROL_WIDTH_CLASS_BY_VARIANT[width],
  ].join(" ");
  const actionButtonClassName =
    "px-1 py-0.5 text-[11px] normal-case text-brass hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  return (
    <Stack gap="0" className="space-y-1.5 py-2.5 first:pt-0 last:pb-0">
      {collapsible && (
        <Stack gap="0" className={headerClassName}>
          <Button
            type="button"
            variant="ghost"
            size="content"
            className={`${controlButtonClassName} bg-transparent hover:bg-transparent hover:opacity-75`}
            onClick={() => setOpen((v) => !v)}
          >
            <span>
              {title}
              {!open && badge && (
                <MetaText as="span" size="xs" marginTop="0" normalCase>
                  <span className="ml-1 text-chart-3">{badge}</span>
                </MetaText>
              )}
            </span>
            <ChevronIcon className={chevronIconClassName} />
          </Button>
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="content"
              className={`${actionButtonClassName} bg-transparent hover:bg-transparent hover:opacity-75`}
              onClick={onReset}
            >
              All
            </Button>
          )}
        </Stack>
      )}

      {!collapsible && (
        <Stack gap="0" className={headerClassName}>
          <span>{title}</span>
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="content"
              className={`${actionButtonClassName} bg-transparent hover:bg-transparent hover:opacity-75`}
              onClick={onReset}
            >
              All
            </Button>
          )}
        </Stack>
      )}

      {(!collapsible || open) && (
        <Stack gap="0" className="space-y-0.5">
          {children}
        </Stack>
      )}
    </Stack>
  );
}

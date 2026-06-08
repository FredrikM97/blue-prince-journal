import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/Stack";
import { MetaText } from "@/components/common/Typography";

type FilterSectionVariant = "default" | "compact";
type FilterSectionWidth = "fill" | "fit";

const CONTROL_TEXT_CLASS_BY_VARIANT: Record<FilterSectionVariant, string> = {
  default: "text-[8px]",
  compact: "text-[10px]",
};

const ACTION_TEXT_CLASS_BY_VARIANT: Record<FilterSectionVariant, string> = {
  default: "text-[8px]",
  compact: "text-[10px]",
};

const CONTROL_WIDTH_CLASS_BY_VARIANT: Record<FilterSectionWidth, string> = {
  fill: "min-w-0 flex-1",
  fit: "w-auto",
};

const CHEVRON_ICON_CLASS_BY_VARIANT: Record<FilterSectionVariant, string> = {
  default: "h-3 w-3",
  compact: "h-2.5 w-2.5",
};

export function FilterSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  width = "fill",
  variant = "default",
  onReset,
  badge,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  width?: FilterSectionWidth;
  variant?: FilterSectionVariant;
  onReset?: () => void;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const ChevronIcon = open ? ChevronDown : ChevronRight;
  const chevronIconClassName = CHEVRON_ICON_CLASS_BY_VARIANT[variant];
  const headerClassName =
    variant === "compact"
      ? "flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
      : "flex items-center justify-between text-[8px] font-medium uppercase tracking-wide text-muted-foreground";
  const controlButtonClassName = [
    "flex min-h-6 cursor-pointer select-none items-center justify-between gap-1 px-1 py-0.5 font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    CONTROL_TEXT_CLASS_BY_VARIANT[variant],
    CONTROL_WIDTH_CLASS_BY_VARIANT[width],
  ].join(" ");
  const actionButtonClassName = [
    "px-1 py-0.5 normal-case text-brass hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    ACTION_TEXT_CLASS_BY_VARIANT[variant],
  ].join(" ");

  return (
    <Stack gap="0" className="space-y-1.5">
      {collapsible && (
        <Stack gap="0" className={headerClassName}>
          <Button
            type="button"
            variant="transparent"
            size="content"
            className={controlButtonClassName}
            onClick={() => setOpen((v) => !v)}
          >
            <span>
              {title}
              {!open && badge && (
                <MetaText as="span" size="xs" marginTop="0" normalCase>
                  <span style={{ marginLeft: "0.25rem", color: "#f59e0b" }}>{badge}</span>
                </MetaText>
              )}
            </span>
            <ChevronIcon className={chevronIconClassName} />
          </Button>
          {onReset && (
            <Button
              type="button"
              variant="transparent"
              size="content"
              className={actionButtonClassName}
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
              variant="transparent"
              size="content"
              className={actionButtonClassName}
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

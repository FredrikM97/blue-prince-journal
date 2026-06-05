import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/Stack";
import { MetaText } from "@/components/common/Typography";

type FilterSectionVariant = "default" | "compact";
type FilterSectionWidth = "fill" | "fit";
type FilterSectionHeaderVariant = "filter-section-header-default" | "filter-section-header-compact";

const HEADER_VARIANT_BY_SIZE: Record<FilterSectionVariant, FilterSectionHeaderVariant> = {
  default: "filter-section-header-default",
  compact: "filter-section-header-compact",
};

const CONTROL_SIZE_BY_VARIANT: Record<FilterSectionVariant, "default" | "compact"> = {
  default: "default",
  compact: "compact",
};

const ACTION_SIZE_BY_VARIANT: Record<FilterSectionVariant, "default" | "compact"> = {
  default: "default",
  compact: "compact",
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
  const headerVariant = HEADER_VARIANT_BY_SIZE[variant];
  const controlSize = CONTROL_SIZE_BY_VARIANT[variant];
  const actionSize = ACTION_SIZE_BY_VARIANT[variant];
  const chevronIconClassName = CHEVRON_ICON_CLASS_BY_VARIANT[variant];

  return (
    <Stack variant="filter-section" gap="0">
      {collapsible && (
        <Stack variant={headerVariant} gap="0">
          <Button
            type="button"
            variant="control-row"
            size="content"
            controlWidth={width}
            controlSize={controlSize}
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
              variant="action-link"
              size="content"
              actionSize={actionSize}
              onClick={onReset}
            >
              All
            </Button>
          )}
        </Stack>
      )}

      {!collapsible && (
        <Stack variant={headerVariant} gap="0">
          <span>{title}</span>
          {onReset && (
            <Button
              type="button"
              variant="action-link"
              size="content"
              actionSize={actionSize}
              onClick={onReset}
            >
              All
            </Button>
          )}
        </Stack>
      )}

      {(!collapsible || open) && (
        <Stack variant="filter-section-body" gap="0">
          {children}
        </Stack>
      )}
    </Stack>
  );
}

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/Stack";
import { MetaText } from "@/components/common/Typography";

type FilterSectionVariant = "default" | "compact";
type FilterSectionWidth = "fill" | "fit";

const HEADER_TEXT_CLASS_BY_VARIANT: Record<FilterSectionVariant, string> = {
  default: "ui-header-text-default",
  compact: "ui-header-text-default ui-header-text-compact",
};

const TOGGLE_WIDTH_CLASS_BY_WIDTH: Record<FilterSectionWidth, string> = {
  fill: "ui-width-fill",
  fit: "ui-width-fit",
};

const TOGGLE_SIZE_CLASS_BY_VARIANT: Record<FilterSectionVariant, string> = {
  default: "ui-control-size-default",
  compact: "ui-control-size-compact",
};

const CLEAR_BUTTON_SIZE_CLASS_BY_VARIANT: Record<FilterSectionVariant, string> = {
  default: "ui-action-link-size-default",
  compact: "ui-action-link-size-compact",
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
  const headerTextClassName = HEADER_TEXT_CLASS_BY_VARIANT[variant];
  const toggleClassName = [
    "ui-control-row",
    TOGGLE_WIDTH_CLASS_BY_WIDTH[width],
    TOGGLE_SIZE_CLASS_BY_VARIANT[variant],
  ].join(" ");
  const clearButtonClassName = ["ui-action-link", CLEAR_BUTTON_SIZE_CLASS_BY_VARIANT[variant]].join(
    " ",
  );
  const chevronIconClassName = CHEVRON_ICON_CLASS_BY_VARIANT[variant];

  return (
    <Stack variant="filter-section" gap="0">
      {collapsible && (
        <Stack variant="filter-section-header" gap="0" className={headerTextClassName}>
          <Button
            type="button"
            variant="transparent"
            size="content"
            justify="between"
            textAlign="left"
            className={toggleClassName}
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
              variant="ghost"
              size="content"
              className={clearButtonClassName}
              onClick={onReset}
            >
              All
            </Button>
          )}
        </Stack>
      )}

      {!collapsible && (
        <Stack variant="filter-section-header" gap="0" className={headerTextClassName}>
          <span>{title}</span>
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="content"
              className={clearButtonClassName}
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

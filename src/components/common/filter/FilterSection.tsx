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
  const chevronIconClassName = "filter-section-chevron";
  const headerClassName = "filter-section-header";
  const controlButtonClassName = [
    "filter-section-control",
    CONTROL_WIDTH_CLASS_BY_VARIANT[width],
  ].join(" ");
  const actionButtonClassName = "filter-section-action";

  return (
    <Stack gap="0" className="section-compact filter-section">
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
                  <span className="filter-section-badge">{badge}</span>
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
        <Stack gap="0" className="filter-section-content">
          {children}
        </Stack>
      )}
    </Stack>
  );
}

import { useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/Stack";
import { MetaText } from "@/components/common/Typography";

export function FilterSection({
  title,
  children,
  collapsible = false,
  defaultOpen = true,
  fullWidth = true,
  onReset,
  badge,
}: {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  fullWidth?: boolean;
  onReset?: () => void;
  badge?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  let useFullWidthToggle = fullWidth;
  if (onReset) {
    useFullWidthToggle = false;
  }

  let collapseIcon = <ChevronRight className="h-3 w-3" />;
  if (open) {
    collapseIcon = <ChevronDown className="h-3 w-3" />;
  }

  return (
    <Stack variant="filter-section" gap="0">
      {collapsible && (
        <Stack variant="filter-section-header" gap="0">
          <Button
            type="button"
            variant="transparent"
            size="sm"
            fullWidth={useFullWidthToggle}
            justify="between"
            textAlign="left"
            className="filter-section-toggle"
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
            {collapseIcon}
          </Button>
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="filter-clear-btn"
              onClick={onReset}
            >
              All
            </Button>
          )}
        </Stack>
      )}

      {!collapsible && (
        <Stack variant="filter-section-header" gap="0">
          <span>{title}</span>
          {onReset && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="filter-clear-btn"
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

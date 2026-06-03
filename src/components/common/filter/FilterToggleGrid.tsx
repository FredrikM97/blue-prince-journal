import type { ReactNode } from "react";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/Stack";

type FilterToggleItem = {
  key: string;
  label: ReactNode;
  active: boolean;
  onToggle: () => void;
  dotColor?: string;
};

export function FilterToggleGrid({
  items,
  leftAligned = false,
  size = "default",
  layout = "grid",
  width = "full",
}: {
  items: FilterToggleItem[];
  leftAligned?: boolean;
  size?: "default" | "compact";
  layout?: "grid" | "wrap";
  width?: "full" | "fit";
}) {
  let layoutVariant: "filter-grid" | "filter-grid-wrap" = "filter-grid";
  if (layout === "wrap") {
    layoutVariant = "filter-grid-wrap";
  }

  return (
    <Stack variant={layoutVariant} gap="0">
      {items.map((item) => {
        let align: "center" | "left" = "center";
        if (leftAligned) {
          align = "left";
        }

        return (
          <Button
            key={item.key}
            type="button"
            variant="filter-toggle"
            size="sm"
            active={item.active}
            align={align}
            density={size}
            width={width}
            onClick={item.onToggle}
          >
            {item.dotColor && (
              <span
                style={{
                  width: "0.5rem",
                  height: "0.5rem",
                  flexShrink: 0,
                  borderRadius: "9999px",
                  background: item.dotColor,
                }}
              />
            )}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.label}
            </span>
          </Button>
        );
      })}
    </Stack>
  );
}

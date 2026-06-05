import type { ReactNode } from "react";
import { Button } from "@/components/common/Button";
import { Grid, Inline } from "@/components/common/LayoutPrimitives";

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
  activeStyle = "filled",
}: {
  items: FilterToggleItem[];
  leftAligned?: boolean;
  size?: "default" | "compact";
  layout?: "grid" | "wrap";
  width?: "full" | "fit";
  activeStyle?: "filled" | "outline";
}) {
  if (layout === "wrap") {
    return (
      <Inline as="div" gap="1.5" wrap className="w-full">
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
              toggleStateStyle={activeStyle}
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
      </Inline>
    );
  }

  return (
    <Grid variant="auto-fit" gap="2">
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
            toggleStateStyle={activeStyle}
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
    </Grid>
  );
}

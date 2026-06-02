import type { ReactNode } from "react";
import { FilterToggleButton } from "@/components/common/Button";

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
  let layoutClass = "filter-grid";
  if (layout === "wrap") {
    layoutClass = "filter-grid-wrap";
  }

  return (
    <div className={layoutClass}>
      {items.map((item) => {
        let align: "center" | "left" = "center";
        if (leftAligned) {
          align = "left";
        }

        return (
          <FilterToggleButton
            key={item.key}
            type="button"
            active={item.active}
            align={align}
            density={size}
            width={width}
            onClick={item.onToggle}
          >
            {item.dotColor && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: item.dotColor }}
              />
            )}
            <span className="truncate">{item.label}</span>
          </FilterToggleButton>
        );
      })}
    </div>
  );
}

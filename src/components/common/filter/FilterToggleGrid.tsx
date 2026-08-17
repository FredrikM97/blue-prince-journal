import type { CSSProperties, ReactNode } from "react";
import { Grid, Inline } from "@/components/common/LayoutPrimitives";

type FilterToggleItem = {
  key: string;
  label: ReactNode;
  active: boolean;
  onToggle: () => void;
  dotColor?: string;
};

function getToggleButtonClass(options: {
  active: boolean;
  leftAligned: boolean;
  size: "default" | "compact";
  width: "full" | "fit";
  activeStyle: "filled" | "outline";
}) {
  const alignClass = options.leftAligned ? "justify-start text-left" : "justify-center text-center";
  const sizeClass =
    options.size === "compact" ? "h-6 px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-[11px]";
  const widthClass = options.width === "fit" ? "w-auto" : "w-full";

  let stateClass = "text-muted-foreground";
  if (options.active && options.activeStyle === "filled") {
    stateClass = "border-primary bg-primary text-primary-foreground";
  }
  if (options.active && options.activeStyle === "outline") {
    stateClass = "border-primary bg-card text-foreground";
  }

  return [
    "flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card transition-colors hover:border-primary hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    alignClass,
    sizeClass,
    widthClass,
    stateClass,
  ].join(" ");
}

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
  const dotClassName = "h-2 w-2 shrink-0 rounded-full";
  const labelClassName = "overflow-hidden text-ellipsis whitespace-nowrap";

  if (layout === "wrap") {
    return (
      <Inline as="div" gap="1.5" wrap className="w-full gap-y-1.5">
        {items.map((item) => {
          const buttonClassName = getToggleButtonClass({
            active: item.active,
            leftAligned,
            size,
            width,
            activeStyle,
          });

          return (
            <button
              key={item.key}
              type="button"
              className={buttonClassName}
              onClick={item.onToggle}
            >
              {item.dotColor && (
                <span
                  className={dotClassName}
                  style={{ background: item.dotColor } as CSSProperties}
                />
              )}
              <span className={labelClassName}>{item.label}</span>
            </button>
          );
        })}
      </Inline>
    );
  }

  return (
    <Grid
      className="w-full gap-x-2 gap-y-1.5 [grid-template-columns:repeat(auto-fit,minmax(min(6.75rem,100%),1fr))]"
    >
      {items.map((item) => {
        const buttonClassName = getToggleButtonClass({
          active: item.active,
          leftAligned,
          size,
          width,
          activeStyle,
        });

        return (
          <button
            key={item.key}
            type="button"
            className={buttonClassName}
            onClick={item.onToggle}
          >
            {item.dotColor && (
              <span
                className={dotClassName}
                style={{ background: item.dotColor } as CSSProperties}
              />
            )}
            <span className={labelClassName}>{item.label}</span>
          </button>
        );
      })}
    </Grid>
  );
}

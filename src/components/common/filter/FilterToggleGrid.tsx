type FilterToggleItem = {
  key: string;
  label: string;
  active: boolean;
  onToggle: () => void;
  dotColor?: string;
};

export function FilterToggleGrid({
  items,
  leftAligned = false,
}: {
  items: FilterToggleItem[];
  leftAligned?: boolean;
}) {
  return (
    <div className="filter-grid">
      {items.map((item) => {
        let buttonClass = "filter-toggle filter-toggle-off";
        if (leftAligned) {
          buttonClass = "filter-toggle text-left filter-toggle-off";
        }
        if (item.active) {
          buttonClass = buttonClass.replace("filter-toggle-off", "filter-toggle-on");
        }

        return (
          <button key={item.key} onClick={item.onToggle} className={buttonClass}>
            {item.dotColor && (
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: item.dotColor }}
              />
            )}
            <span className="truncate capitalize">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

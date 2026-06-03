import type { ReactNode } from "react";
import { FilterToggleGrid } from "@/components/common/filter/FilterToggleGrid";
import { Stack } from "@/components/common/Stack";

type FilterOption<T extends string> = {
  value: T;
  label: ReactNode;
};

export function FilterButtonGroup<T extends string>({
  value,
  options,
  onChange,
  allLabel = "All",
}: {
  value: T | null;
  options: Array<FilterOption<T>>;
  onChange: (next: T | null) => void;
  allLabel?: ReactNode;
}) {
  const items = [
    {
      key: "__all__",
      label: allLabel,
      active: value === null,
      onToggle: () => onChange(null),
    },
    ...options.map((option) => ({
      key: option.value,
      label: option.label,
      active: value === option.value,
      onToggle: () => {
        if (value === option.value) {
          onChange(null);
          return;
        }
        onChange(option.value);
      },
    })),
  ];

  return (
    <Stack variant="filter-options" gap="0">
      <FilterToggleGrid items={items} leftAligned size="compact" layout="wrap" width="fit" />
    </Stack>
  );
}

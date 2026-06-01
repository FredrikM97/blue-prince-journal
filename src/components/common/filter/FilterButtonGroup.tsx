import type { ReactNode } from "react";
import { SelectButton } from "@/components/common/Button";

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
  return (
    <div className="filter-options">
      <SelectButton active={value === null} onClick={() => onChange(null)}>
        {allLabel}
      </SelectButton>
      {options.map((option) => (
        <SelectButton
          key={option.value}
          active={value === option.value}
          onClick={() => {
            if (value === option.value) {
              onChange(null);
              return;
            }
            onChange(option.value);
          }}
        >
          {option.label}
        </SelectButton>
      ))}
    </div>
  );
}

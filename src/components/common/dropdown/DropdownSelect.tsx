/**
 * DropdownSelect — a styled select-style button backed by a DropdownMenu.
 * Use when you need a compact single-value picker without a native <select>.
 */

import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/dropdown/DropdownMenu";
import { SelectTriggerButton } from "@/components/common/dropdown/SelectTriggerButton";

export interface DropdownSelectOption {
  value: string;
  label: string;
}

export function DropdownSelectComponent({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
}: {
  value: string;
  onValueChange: (next: string) => void;
  options: DropdownSelectOption[];
  placeholder?: string;
}) {
  const activeOption = options.find((option) => option.value === value);
  const hasValue = activeOption !== undefined;
  let activeLabel: string | undefined;
  if (activeOption) activeLabel = activeOption.label;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <SelectTriggerButton
          valueLabel={activeLabel}
          placeholder={placeholder}
          hasValue={hasValue}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="dropdown-select-content">
        {options.map((option) => {
          const activeClass = option.value === value ? "menu-item-active" : "";
          return (
            <DropdownMenuItem
              key={option.value}
              className={activeClass}
              onSelect={() => onValueChange(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const DropdownSelect = memo(DropdownSelectComponent);

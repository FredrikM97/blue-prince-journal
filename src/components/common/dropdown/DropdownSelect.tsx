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
import { DropdownTriggerButton } from "@/components/common/dropdown/SelectTriggerButton";

export interface DropdownSelectOption {
  value: string;
  label: string;
}

export function DropdownSelectComponent({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  triggerWidth = "full",
  triggerVariant = "default",
}: {
  value: string;
  onValueChange: (next: string) => void;
  options: DropdownSelectOption[];
  placeholder?: string;
  triggerWidth?: "full" | "fit";
  triggerVariant?: "default" | "room" | "flat";
}) {
  const activeOption = options.find((option) => option.value === value);
  const hasValue = activeOption !== undefined;
  let activeLabel: string | undefined;
  if (activeOption) activeLabel = activeOption.label;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <DropdownTriggerButton
          valueLabel={activeLabel}
          placeholder={placeholder}
          hasValue={hasValue}
          triggerWidth={triggerWidth}
          variant={triggerVariant}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" variant="select">
        {options.map((option) => {
          let itemTone: "default" | "active" = "default";
          if (option.value === value) itemTone = "active";
          return (
            <DropdownMenuItem
              key={option.value}
              tone={itemTone}
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

/**
 * DropdownSelect — a styled select-style button backed by a DropdownMenu.
 * Use when you need a compact single-value picker without a native <select>.
 */

import { memo } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/dropdown/DropdownMenu";

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
  const triggerTextClass = activeOption ? "text-foreground" : "text-muted-foreground";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-9 w-full justify-between bg-card/65 px-3 py-2 text-sm font-normal"
        >
          <span className={triggerTextClass}>
            {activeOption?.label ?? placeholder}
          </span>
          <ChevronDown className="icon-md opacity-50" />
        </Button>
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


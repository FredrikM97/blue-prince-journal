/**
 * DropdownSelect — a styled select-style button backed by a DropdownMenu.
 * Use when you need a compact single-value picker without a native <select>.
 */

import { memo } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/common/Button";
import { MetaText, Text } from "@/components/common/Typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/menu/DropdownMenu";

type SelectOption = {
  value: string;
  label: string;
};

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
  options: SelectOption[];
  placeholder?: string;
  triggerWidth?: "full" | "fit";
  triggerVariant?: "default" | "room" | "flat";
}) {
  const activeOption = options.find((option) => option.value === value);
  const hasValue = activeOption !== undefined;
  let activeLabel: string | undefined;
  if (activeOption) activeLabel = activeOption.label;

  const isFlat = triggerVariant === "flat";
  const isFit = triggerWidth === "fit";
  const buttonVariant: "outline" | "ghost" = isFlat ? "ghost" : "outline";

  let triggerWrapperClassName = "w-full";
  if (isFit) triggerWrapperClassName = "w-auto min-w-40";

  let triggerButtonClassName = "h-9 w-full justify-between border-input bg-secondary px-3 py-2 text-sm font-normal hover:bg-secondary";
  if (isFit) {
    triggerButtonClassName = `${triggerButtonClassName} w-auto min-w-40`;
  }
  if (isFlat) {
    triggerButtonClassName = "h-9 w-full justify-between border-transparent bg-transparent px-3 py-2 text-sm font-normal shadow-none hover:bg-transparent";
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <div className={triggerWrapperClassName} data-has-value={hasValue}>
          <Button type="button" variant={buttonVariant} className={triggerButtonClassName}>
            <span className={hasValue ? "text-foreground" : "text-muted-foreground"}>
              {hasValue && activeLabel ? (
                <Text as="span" size="sm">
                  {activeLabel}
                </Text>
              ) : (
                <MetaText as="span" size="sm">
                  {placeholder}
                </MetaText>
              )}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </div>
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

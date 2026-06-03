import { ChevronDown } from "lucide-react";
import { forwardRef, type ComponentProps } from "react";
import { Button } from "@/components/common/Button";
import { MetaText, Text } from "@/components/common/Typography";

type DropdownTriggerVariant = "default" | "room";

type DropdownTriggerButtonProps = Omit<ComponentProps<typeof Button>, "children" | "variant"> & {
  valueLabel?: string;
  placeholder: string;
  hasValue: boolean;
  variant?: DropdownTriggerVariant;
};

export const DropdownTriggerButton = forwardRef<HTMLButtonElement, DropdownTriggerButtonProps>(
  function DropdownTriggerButton(
    { valueLabel, placeholder, hasValue, variant = "default", ...buttonProps },
    ref,
  ) {
    let triggerText = (
      <MetaText as="span" size="sm">
        {placeholder}
      </MetaText>
    );
    if (hasValue && valueLabel) {
      triggerText = (
        <Text as="span" size="sm">
          {valueLabel}
        </Text>
      );
    }

    let triggerClass = "dropdown-trigger";
    if (variant === "room") {
      triggerClass = "dropdown-trigger dropdown-trigger-room";
    }

    return (
      <Button
        ref={ref}
        type="button"
        variant="outline"
        className={triggerClass}
        data-has-value={hasValue}
        {...buttonProps}
      >
        <span className="dropdown-trigger-label">{triggerText}</span>
        <ChevronDown className="icon-md opacity-50" />
      </Button>
    );
  },
);

export const SelectTriggerButton = DropdownTriggerButton;

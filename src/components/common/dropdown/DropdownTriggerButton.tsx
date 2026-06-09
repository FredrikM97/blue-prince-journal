import { ChevronDown } from "lucide-react";
import { forwardRef, type ComponentProps } from "react";
import { Button } from "@/components/common/Button";
import { MetaText, Text } from "@/components/common/Typography";

type DropdownTriggerVariant = "default" | "room" | "flat";
type DropdownTriggerWidth = "full" | "fit";

type DropdownTriggerButtonProps = Omit<
  ComponentProps<typeof Button>,
  "children" | "variant" | "className"
> & {
  valueLabel?: string;
  placeholder: string;
  hasValue: boolean;
  variant?: DropdownTriggerVariant;
  triggerWidth?: DropdownTriggerWidth;
};

export const DropdownTriggerButton = forwardRef<HTMLButtonElement, DropdownTriggerButtonProps>(
  function DropdownTriggerButton(
    {
      valueLabel,
      placeholder,
      hasValue,
      variant = "default",
      triggerWidth = "full",
      ...buttonProps
    },
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
    if (variant === "flat") {
      triggerClass = "dropdown-trigger dropdown-trigger-flat";
    }
    if (triggerWidth === "fit") {
      triggerClass = `${triggerClass} dropdown-trigger-fit`;
    }

    let buttonVariant: "outline" | "ghost" = "outline";
    if (variant === "flat") {
      buttonVariant = "ghost";
    }

    return (
      <div className={triggerClass} data-has-value={hasValue}>
        <Button ref={ref} type="button" variant={buttonVariant} {...buttonProps}>
          <span className="dropdown-trigger-label">{triggerText}</span>
          <ChevronDown className="icon-md opacity-50" />
        </Button>
      </div>
    );
  },
);

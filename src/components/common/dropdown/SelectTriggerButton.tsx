import { ChevronDown } from "lucide-react";
import { forwardRef, type ComponentProps } from "react";
import { Button } from "@/components/common/Button";
import { MetaText, Text } from "@/components/common/Typography";

type SelectTriggerButtonProps = Omit<ComponentProps<typeof Button>, "children"> & {
  valueLabel?: string;
  placeholder: string;
  hasValue: boolean;
};

export const SelectTriggerButton = forwardRef<HTMLButtonElement, SelectTriggerButtonProps>(
  function SelectTriggerButton({ valueLabel, placeholder, hasValue, ...buttonProps }, ref) {
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

    return (
      <Button
        ref={ref}
        type="button"
        variant="outline"
        className="room-dropdown-trigger"
        data-has-value={hasValue}
        {...buttonProps}
      >
        <span className="room-trigger-label">{triggerText}</span>
        <ChevronDown className="icon-md opacity-50" />
      </Button>
    );
  },
);

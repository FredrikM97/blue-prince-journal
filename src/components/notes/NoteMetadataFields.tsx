import type { ReactNode } from "react";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { RoomDropdown } from "@/components/common/dropdown/RoomDropdown";
import { InputField } from "@/components/common/input/InputField";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { MetaText } from "@/components/common/Typography";

type SelectOption = {
  value: string;
  label: string;
};

type NoteMetadataFieldsProps = {
  typeLabel?: string;
  typeValue: string;
  onTypeChange: (value: string) => void;
  typeOptions: SelectOption[];
  roomValue: string;
  onRoomChange: (value: string) => void;
  roomClearLabel?: string;
  tagsValue: string;
  onTagsChange: (value: string) => void;
  onTagsFocus?: () => void;
  onTagsBlur?: () => void;
  dateValue: string;
  onDateChange: (value: string) => void;
  datePlaceholder?: string;
  extraField?: ReactNode;
};

export function NoteMetadataFields({
  typeLabel = "Type / category",
  typeValue,
  onTypeChange,
  typeOptions,
  roomValue,
  onRoomChange,
  roomClearLabel,
  tagsValue,
  onTagsChange,
  onTagsFocus,
  onTagsBlur,
  dateValue,
  onDateChange,
  datePlaceholder = "Spring 1, Day 3",
  extraField,
}: NoteMetadataFieldsProps) {
  return (
    <Stack gap="2">
      <Inline gap="2" wrap align="start">
        <Stack as="div" gap="1">
          <MetaText as="p" size="xs" weight="medium" normalCase>
            {typeLabel}
          </MetaText>
          <DropdownSelect value={typeValue} onValueChange={onTypeChange} options={typeOptions} />
        </Stack>

        <Stack as="div" gap="1">
          <MetaText as="p" size="xs" weight="medium" normalCase>
            Room
          </MetaText>
          <RoomDropdown
            value={roomValue}
            onValueChange={onRoomChange}
            clearLabel={roomClearLabel}
          />
        </Stack>

        {extraField}
      </Inline>

      <Inline gap="2" wrap align="start">
        <Stack as="div" gap="1">
          <InputField
            label="Tags"
            value={tagsValue}
            onFocus={onTagsFocus}
            onBlur={onTagsBlur}
            onChange={onTagsChange}
            placeholder="safe, gem, puzzle"
            size="sm"
            width="compact"
          />
        </Stack>

        <Stack as="div" gap="1">
          <InputField
            label="Date"
            value={dateValue}
            onChange={onDateChange}
            placeholder={datePlaceholder}
            size="sm"
            width="compact"
          />
        </Stack>
      </Inline>
    </Stack>
  );
}
import type { MouseEvent } from "react";
import { ImageCard } from "@/components/common/ImageCard";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { MetaText, Text } from "@/components/common/Typography";

type NoteImageAttachmentsProps = {
  imageIds: string[];
  resolveLabel: (id: string) => string;
  onRemove: (id: string) => void;
  countPrefix?: string;
  heading?: string;
  emptyMessage?: string;
  panel?: boolean;
};

export function NoteImageAttachments({
  imageIds,
  resolveLabel,
  onRemove,
  countPrefix,
  heading,
  emptyMessage,
  panel = false,
}: NoteImageAttachmentsProps) {
  const wrapperVariant = panel ? "panel-card" : undefined;

  return (
    <Stack gap={panel ? "2" : "1"} variant={wrapperVariant}>
      {heading && (
        <Inline gap="2" justify="between" wrap align="center">
          <Text as="span" size="sm" weight="medium">
            {heading}
          </Text>
        </Inline>
      )}

      {countPrefix && <MetaText>{countPrefix} {imageIds.length}</MetaText>}

      {imageIds.length > 0 ? (
        <Stack gap="0" className="h-scroll-strip">
          {imageIds.map((id) => (
            <ImageCard
              key={id}
              id={id}
              label={resolveLabel(id)}
              size="sm"
              onRemove={(event: MouseEvent) => {
                event.stopPropagation();
                onRemove(id);
              }}
            />
          ))}
        </Stack>
      ) : (
        emptyMessage && <MetaText>{emptyMessage}</MetaText>
      )}
    </Stack>
  );
}
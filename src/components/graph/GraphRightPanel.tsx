import { Chip } from "@/components/common/Chip";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { AttachedImagesGallery } from "@/components/common/AttachedImagesGallery";
import { Heading, MetaText, Text } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";
import { Inline, SectionBlock } from "@/components/common/LayoutPrimitives";
import { SidePanelRight } from "@/components/common/SidePanel";
import type { Note } from "@/lib/types";

/**
 * Right-side inspector panel for graph summary and selected entry details.
 */
export function GraphRightPanel({
  noteCount,
  edgeCount,
  selectedNote,
  incomingCount,
  outgoingCount,
  onClose,
}: {
  noteCount: number;
  edgeCount: number;
  selectedNote: Note | null;
  incomingCount: number;
  outgoingCount: number;
  onClose: () => void;
}) {
  let panelTitle = "Preview";
  let panelSubtitle = `${noteCount} entries · ${edgeCount} links`;
  if (selectedNote) {
    panelTitle = selectedNote.title;
    panelSubtitle = `${selectedNote.type} · ${outgoingCount} out · ${incomingCount} in`;
  }

  const summary = (
    <Stack gap="3">
      <Text size="sm" tone="muted">
        Arrows reflect explicit references in entry text: @room and #tag.
      </Text>
      <Inline gap="3">
        <MetaText as="span" size="sm">
          {noteCount} entries
        </MetaText>
        <MetaText as="span" size="sm">
          {edgeCount} links
        </MetaText>
      </Inline>
    </Stack>
  );

  if (!selectedNote) {
    return (
      <SidePanelRight title={panelTitle} subtitle={panelSubtitle} onClose={onClose}>
        <Stack gap="3">
          {summary}
          <Text size="sm" tone="muted">
            Select a note node to inspect details.
          </Text>
        </Stack>
      </SidePanelRight>
    );
  }

  return (
    <SidePanelRight title={panelTitle} subtitle={panelSubtitle} onClose={onClose}>
      <Stack gap="4">
        {summary}

        <Stack gap="2" variant="panel-card">
          <Heading as="h3" size="base" variant="section-label">
            Info
          </Heading>
          <Text as="div" size="base">
            <Stack gap="2">
              <Inline gap="2">
                <Text
                  as="span"
                  size="xs"
                  tone="muted"
                  weight="medium"
                  className="preview-field-label"
                >
                  Type
                </Text>
                <Chip>{selectedNote.type}</Chip>
              </Inline>

              {selectedNote.room && (
                <Inline gap="2">
                  <Text
                    as="span"
                    size="xs"
                    tone="muted"
                    weight="medium"
                    className="preview-field-label"
                  >
                    Room
                  </Text>
                  <Chip variant="room">@{selectedNote.room}</Chip>
                </Inline>
              )}

              {selectedNote.tags.length > 0 && (
                <Inline align="start" gap="2">
                  <Text
                    as="span"
                    size="xs"
                    tone="muted"
                    weight="medium"
                    className="preview-field-label"
                  >
                    Tags
                  </Text>
                  <Inline gap="1.5" wrap>
                    {selectedNote.tags.map((tag) => (
                      <Chip key={tag}>#{tag}</Chip>
                    ))}
                  </Inline>
                </Inline>
              )}

              <Inline gap="3">
                <MetaText as="span" size="sm">
                  Outgoing: {outgoingCount}
                </MetaText>
                <MetaText as="span" size="sm">
                  Incoming: {incomingCount}
                </MetaText>
              </Inline>
            </Stack>
          </Text>
        </Stack>

        <SectionBlock>
          <Stack gap="1">
            <Heading as="h3" size="base" variant="section-label">
              Note body
            </Heading>
            {selectedNote.body.trim() ? (
              <MarkdownPreview>{selectedNote.body}</MarkdownPreview>
            ) : (
              <MetaText>No details written for this note yet.</MetaText>
            )}

            <AttachedImagesGallery imageIds={selectedNote.imageIds} compact />
          </Stack>
        </SectionBlock>
      </Stack>
    </SidePanelRight>
  );
}

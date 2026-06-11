import { Chip } from "@/components/common/Chip";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { AttachedImagesGallery } from "@/components/common/AttachedImagesGallery";
import { Heading, MetaText, Text } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";
import { Inline } from "@/components/common/LayoutPrimitives";
import { MetaRow, PreviewSection } from "@/components/common/preview/PreviewContent";
import { SidePanelRight } from "@/components/common/SidePanel";
import type { Note } from "@/lib/types";

type GraphPreviewContentProps = {
  noteCount: number;
  edgeCount: number;
  selectedNote: Note | null;
  incomingCount: number;
  outgoingCount: number;
};

export function GraphPreviewContent({
  noteCount,
  edgeCount,
  selectedNote,
  incomingCount,
  outgoingCount,
}: GraphPreviewContentProps) {
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
      <Stack gap="3">
        {summary}
        <Text size="sm" tone="muted">
          Select a note node to inspect details.
        </Text>
      </Stack>
    );
  }

  return (
    <Stack gap="4">
      {summary}

      <PreviewSection>
        <Stack gap="2">
          <Heading as="h3" size="base" variant="section-label">
            Info
          </Heading>

          <MetaRow label="Type">
            <Chip variant="solid">{selectedNote.type}</Chip>
          </MetaRow>

          {selectedNote.room && (
            <MetaRow label="Room">
              <Chip variant="room">@{selectedNote.room}</Chip>
            </MetaRow>
          )}

          {selectedNote.tags.length > 0 && (
            <MetaRow label="Tags">
              <Inline as="div" gap="1" wrap align="start">
                {selectedNote.tags.map((tag) => (
                  <Chip key={tag} variant="tag">
                    #{tag}
                  </Chip>
                ))}
              </Inline>
            </MetaRow>
          )}

          <MetaRow label="Links">
            <Inline as="div" gap="3" align="start">
              <MetaText as="span" size="sm">
                Outgoing: {outgoingCount}
              </MetaText>
              <MetaText as="span" size="sm">
                Incoming: {incomingCount}
              </MetaText>
            </Inline>
          </MetaRow>
        </Stack>
      </PreviewSection>

      <PreviewSection>
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
      </PreviewSection>
    </Stack>
  );
}

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
}: GraphPreviewContentProps & {
  onClose: () => void;
}) {
  let panelTitle = "Preview";
  let panelSubtitle = `${noteCount} entries · ${edgeCount} links`;
  if (selectedNote) {
    panelTitle = selectedNote.title;
    panelSubtitle = `${selectedNote.type} · ${outgoingCount} out · ${incomingCount} in`;
  }

  return (
    <SidePanelRight title={panelTitle} subtitle={panelSubtitle} onClose={onClose}>
      <GraphPreviewContent
        noteCount={noteCount}
        edgeCount={edgeCount}
        selectedNote={selectedNote}
        incomingCount={incomingCount}
        outgoingCount={outgoingCount}
      />
    </SidePanelRight>
  );
}

/**
 * PagedNotesList — shows a list of notes one at a time with prev/next navigation.
 *
 * Used in the map right panel (notes in a room) and the images right panel (notes linked to
 * an image). Both panels show the same rich note card: title, markdown body, and type/tag chips.
 *
 * When only one note exists the navigation controls are hidden.
 * Changing the `notes` array length resets the active index via key — callers should pass an
 * appropriate `key` prop when the context changes (e.g. selected cell, selected image).
 */
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Inline, SectionHeader, SectionHeaderActions } from "@/components/common/LayoutPrimitives";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { Heading, MetaText, Text } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";
import type { Note } from "@/lib/types";

export function PagedNotesList({
  notes,
  title,
  emptyLabel = "No notes.",
  cardVariant = "panel-card",
}: {
  notes: Note[];
  title: string;
  emptyLabel?: string;
  cardVariant?: "panel-card" | "default";
}) {
  const [index, setIndex] = useState(0);
  const cardClassName = cardVariant === "panel-card" ? "panel-card" : "";
  const total = notes.length;
  const safeIndex = total === 0 ? 0 : ((index % total) + total) % total;
  const note = notes[safeIndex] ?? null;

  return (
    <div>
      <SectionHeader density="compact">
        <Heading as="h3" size="base" variant="section-label">
          {title}
        </Heading>
        {total > 1 && (
          <SectionHeaderActions density="compact">
            <Button
              variant="outline"
              size="icon-h2"
              onClick={() => setIndex((i) => (((i - 1) % total) + total) % total)}
              aria-label="Previous note"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <MetaText as="span" tabular>
              {safeIndex + 1} / {total}
            </MetaText>
            <Button
              variant="outline"
              size="icon-h2"
              onClick={() => setIndex((i) => (i + 1) % total)}
              aria-label="Next note"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </SectionHeaderActions>
        )}
      </SectionHeader>

      {note ? (
        <Text as="div" size="sm" className={cardClassName}>
          <Stack gap="1.5">
            <Text weight="medium">{note.title}</Text>
            {note.body.trim() && <MarkdownPreview>{note.body}</MarkdownPreview>}
            <Inline gap="1" wrap>
              <Chip variant="solid">{note.type}</Chip>
              {note.imageIds.length > 0 && <Chip variant="solid">📎 {note.imageIds.length}</Chip>}
              {note.tags.map((tag) => (
                <Chip key={tag} variant="tag">
                  #{tag}
                </Chip>
              ))}
            </Inline>
          </Stack>
        </Text>
      ) : (
        <MetaText>{emptyLabel}</MetaText>
      )}
    </div>
  );
}

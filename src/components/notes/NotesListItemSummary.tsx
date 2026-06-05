import { memo } from "react";
import type { Note } from "@/lib/types";
import { Lightbulb } from "lucide-react";
import { TYPE_ICON, TYPE_LABEL, relTime } from "@/lib/noteMetadata";
import { Chip } from "@/components/common/Chip";
import { Text } from "@/components/common/Typography";
import { Stack } from "@/components/common/Stack";

const TYPE_ICON_VARIANT: Record<
  Note["type"],
  | "note-summary-icon-clue"
  | "note-summary-icon-code"
  | "note-summary-icon-observation"
  | "note-summary-icon-theory"
  | "note-summary-icon-story"
  | "note-summary-icon-task"
> = {
  clue: "note-summary-icon-clue",
  code: "note-summary-icon-code",
  observation: "note-summary-icon-observation",
  theory: "note-summary-icon-theory",
  story: "note-summary-icon-story",
  task: "note-summary-icon-task",
};

export const NotesListItemSummary = memo(function NotesListItemSummary({ note }: { note: Note }) {
  const Icon = TYPE_ICON[note.type] ?? Lightbulb;

  return (
    <Stack variant="note-summary-wrap" gap="0">
      <Stack as="span" variant={TYPE_ICON_VARIANT[note.type]} gap="0">
        <Icon
          className="note-summary-icon-svg group-hover:scale-110"
          aria-label={`Type: ${TYPE_LABEL[note.type]}`}
        />
      </Stack>
      <Stack variant="note-summary-body" gap="0">
        <Text as="div" size="sm" weight="normal" truncate>
          {note.title}
        </Text>
        <Stack variant="note-summary-meta" gap="0">
          <Stack variant="note-summary-pills" gap="0">
            <Stack as="span" variant="note-summary-time" gap="0">
              {relTime(note.updatedAt)}
            </Stack>
            <Stack as="span" variant="note-summary-tags-date" gap="0">
              {note.date && (
                <Stack as="span" variant="note-pill-date" gap="0">
                  {note.date}
                </Stack>
              )}
              {note.tags.map((t) => (
                <Chip key={t} variant="tag">
                  #{t}
                </Chip>
              ))}
            </Stack>
            {note.room && <Chip variant="room">@{note.room}</Chip>}
            {note.status === "solved" && (
              <Stack as="span" variant="note-pill-solved" gap="0">
                solved
              </Stack>
            )}
            {note.imageIds.length > 0 && (
              <Stack as="span" variant="note-summary-image-count" gap="0">
                📎 {note.imageIds.length}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
});

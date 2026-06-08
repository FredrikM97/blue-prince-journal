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
  const iconClassName = `note-summary-icon ${TYPE_ICON_VARIANT[note.type]}`;

  return (
    <Stack gap="0" className="note-summary-wrap">
      <Stack as="span" gap="0" className={iconClassName}>
        <Icon
          className="note-summary-icon-svg group-hover:scale-110"
          aria-label={`Type: ${TYPE_LABEL[note.type]}`}
        />
      </Stack>
      <Stack gap="0" className="note-summary-body">
        <Text as="div" size="sm" weight="normal" truncate>
          {note.title}
        </Text>
        <Stack gap="0" className="note-summary-meta">
          <Stack gap="0" className="note-summary-pills">
            <Stack as="span" gap="0" className="note-summary-time">
              {relTime(note.updatedAt)}
            </Stack>
            <Stack as="span" gap="0" className="note-summary-tags-date">
              {note.date && (
                <Stack as="span" gap="0" className="note-pill note-pill-date">
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
              <Stack as="span" gap="0" className="note-pill note-pill-solved">
                solved
              </Stack>
            )}
            {note.imageIds.length > 0 && (
              <Stack as="span" gap="0" className="note-summary-image-count">
                📎 {note.imageIds.length}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
});

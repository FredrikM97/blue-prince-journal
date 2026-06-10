import { memo } from "react";
import type { Note } from "@/lib/types";
import { Lightbulb } from "lucide-react";
import { TYPE_ICON, TYPE_LABEL, relTime } from "@/lib/noteMetadata";
import { Chip } from "@/components/common/Chip";
import { Text } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";

const TYPE_ICON_VARIANT: Record<
  Note["type"],
  | "bg-secondary text-chart-1 group-hover:bg-accent"
  | "bg-secondary text-chart-2 group-hover:bg-accent"
  | "bg-secondary text-chart-4 group-hover:bg-accent"
  | "bg-secondary text-chart-5 group-hover:bg-accent"
  | "bg-secondary text-destructive group-hover:bg-accent"
  | "bg-secondary text-primary group-hover:bg-accent"
> = {
  clue: "bg-secondary text-chart-1 group-hover:bg-accent",
  code: "bg-secondary text-chart-2 group-hover:bg-accent",
  observation: "bg-secondary text-chart-4 group-hover:bg-accent",
  theory: "bg-secondary text-chart-5 group-hover:bg-accent",
  story: "bg-secondary text-destructive group-hover:bg-accent",
  task: "bg-secondary text-primary group-hover:bg-accent",
};

export const NotesListItemSummary = memo(function NotesListItemSummary({ note }: { note: Note }) {
  const Icon = TYPE_ICON[note.type] ?? Lightbulb;
  const iconClassName = `mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors ${TYPE_ICON_VARIANT[note.type]}`;

  return (
    <Stack gap="0" className="flex w-full min-w-0 items-start gap-3">
      <Stack as="span" gap="0" className={iconClassName}>
        <Icon
          className="h-4 w-4 transition-transform group-hover:scale-110"
          aria-label={`Type: ${TYPE_LABEL[note.type]}`}
        />
      </Stack>
      <Stack gap="0" className="min-w-0 flex-1">
        <Text as="div" size="sm" weight="normal" truncate>
          {note.title}
        </Text>
        <Stack gap="0" className="mt-0.5 flex min-w-0 flex-col items-start gap-1">
          <Stack gap="0" className="flex w-full min-w-0 flex-wrap items-center gap-1.5">
            <Stack as="span" gap="0" className="shrink-0 whitespace-nowrap text-[10px] text-muted-foreground">
              {relTime(note.updatedAt)}
            </Stack>
            <Stack as="span" gap="0" className="inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap">
              {note.date && (
                <Stack
                  as="span"
                  gap="0"
                  className="mr-0.5 inline-flex rounded border border-border px-1.5 py-0.5 text-[10px] text-foreground"
                >
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
              <Stack
                as="span"
                gap="0"
                className="inline-flex rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                solved
              </Stack>
            )}
            {note.imageIds.length > 0 && (
              <Stack
                as="span"
                gap="0"
                className="rounded border border-border px-1 py-0.5 text-[10px] text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary"
              >
                📎 {note.imageIds.length}
              </Stack>
            )}
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
});

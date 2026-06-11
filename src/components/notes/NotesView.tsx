import { memo } from "react";
import type { Note } from "@/lib/types";
import { Button } from "@/components/common/Button";
import { NotesListItemSummary } from "./NotesListItemSummary";
import { Maximize2, Pencil, Trash2 } from "lucide-react";
import { Text } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";
import { useProgressiveVisibleCount } from "@/hooks/useProgressiveVisibleCount";

export function NotesView({
  emptyHint,
  loading = false,
  filtered,
  openCapture,
  onOpenEdit,
  onOpenPreview,
  onOpenExpand,
  onDelete,
}: {
  emptyHint?: string;
  loading?: boolean;
  filtered: Note[];
  openCapture: () => void;
  onOpenEdit: (note: Note) => void;
  onOpenPreview: (note: Note) => void;
  onOpenExpand: (note: Note) => void;
  onDelete: (note: Note) => void;
}) {
  const visibleCount = useProgressiveVisibleCount({
    total: filtered.length,
    enabled: filtered.length > 80,
    initial: 48,
    step: 48,
  });
  const visibleNotes = filtered.slice(0, visibleCount);

  return (
    <Stack as="section" gap="2">
      {!loading && filtered.length === 0 ? (
        <Stack className="rounded-lg border border-dashed border-border p-10 text-center" gap="2">
          <Text size="sm" tone="muted">
            {emptyHint ?? "No notes yet. Press N to add one."}
          </Text>
          <Stack as="div" gap="0" marginTop="2">
            <Button variant="brass" onClick={openCapture}>
              Add your first note
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Stack gap="2">
          {visibleNotes.map((n) => (
            <NotesListRow
              key={n.id}
              note={n}
              onOpenEdit={onOpenEdit}
              onOpenPreview={onOpenPreview}
              onOpenExpand={onOpenExpand}
              onDelete={onDelete}
            />
          ))}
          {visibleCount < filtered.length && (
            <Stack className="rounded-lg border border-border bg-card px-4 py-3" gap="2">
              <div className="h-4 w-1/2 animate-pulse rounded bg-muted/60" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted/50" />
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}

const NotesListRow = memo(function NotesListRow({
  note,
  onOpenEdit,
  onOpenPreview,
  onOpenExpand,
  onDelete,
}: {
  note: Note;
  onOpenEdit: (note: Note) => void;
  onOpenPreview: (note: Note) => void;
  onOpenExpand: (note: Note) => void;
  onDelete: (note: Note) => void;
}) {
  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-accent"
      onClick={() => onOpenPreview(note)}
    >
      <Stack gap="0" className="flex items-center gap-3 px-4 py-3">
        <Stack className="min-w-0 flex-1 overflow-hidden" gap="0">
          <Button
            type="button"
            variant="ghost"
            size="content"
            fullWidth
            justify="start"
            textAlign="left"
            className="flex min-w-0 flex-1 items-start gap-0 rounded-sm bg-transparent hover:bg-transparent hover:opacity-75 focus-visible:ring-0"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPreview(note);
            }}
          >
            <NotesListItemSummary note={note} />
          </Button>
        </Stack>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onOpenExpand(note);
          }}
          aria-label="Expand note preview"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onOpenEdit(note);
          }}
          aria-label="Edit note"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          tone="destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note);
          }}
          aria-label="Delete note"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </Stack>
    </div>
  );
});

import { memo } from "react";
import type { Note } from "@/lib/types";
import { Button } from "@/components/common/Button";
import { NotesListItemSummary } from "./NotesListItemSummary";
import { ChevronRight, Pencil, Trash2 } from "lucide-react";
import { Text } from "@/components/common/Typography";
import { usePageLayoutMobileDrawerControls } from "@/hooks/usePageLayoutMobileDrawer";
import { Stack } from "@/components/common/general/Stack";

export function NotesView({
  emptyHint,
  filtered,
  openCapture,
  onOpenEdit,
  onOpenPreview,
  onDelete,
}: {
  emptyHint?: string;
  filtered: Note[];
  openCapture: () => void;
  onOpenEdit: (note: Note) => void;
  onOpenPreview: (note: Note) => void;
  onDelete: (note: Note) => void;
}) {
  const mobileDrawerControls = usePageLayoutMobileDrawerControls();

  function openRightDrawerIfMobile() {
    if (!mobileDrawerControls?.isPageLayoutMobile) return;
    mobileDrawerControls.openMobileDrawer("right");
  }

  return (
    <Stack as="section" className="space-y-2" gap="2">
      {filtered.length === 0 ? (
        <Stack className="notes-view-empty" gap="2">
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
        <Stack className="notes-view-list" gap="2">
          {filtered.map((n) => (
            <NotesListRow
              key={n.id}
              note={n}
              onOpenEdit={(note) => {
                onOpenEdit(note);
                openRightDrawerIfMobile();
              }}
              onOpenPreview={(note) => {
                onOpenPreview(note);
                openRightDrawerIfMobile();
              }}
              onDelete={onDelete}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

const NotesListRow = memo(function NotesListRow({
  note,
  onOpenEdit,
  onOpenPreview,
  onDelete,
}: {
  note: Note;
  onOpenEdit: (note: Note) => void;
  onOpenPreview: (note: Note) => void;
  onDelete: (note: Note) => void;
}) {
  return (
    <Stack gap="0" className="note-row-item">
      <Stack gap="0" className="note-row-inner">
        <Stack className="item-title" gap="0">
          <Button
            type="button"
            variant="ghost"
            size="content"
            fullWidth
            justify="start"
            textAlign="left"
            className="bg-transparent hover:bg-transparent hover:opacity-75"
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
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onOpenPreview(note);
          }}
          aria-label="Preview note"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Stack>
    </Stack>
  );
});

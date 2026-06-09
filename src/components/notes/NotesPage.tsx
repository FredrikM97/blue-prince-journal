import { useState } from "react";
import { PenLine, Save } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { db } from "@/data/db";
import { saveNote, removeNote } from "@/data/mutations/noteMutations";
import { removeTodo } from "@/data/mutations/todoMutations";
import type { Note, NoteType, Todo } from "@/lib/types";
import { PageLayout } from "@/components/common/PageLayout";
import { Button } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import { NotesCreatePanel } from "./NotesCreatePanel";
import { NotesEditorPanel } from "./NotesEditorPanel";
import { NotesFilterPanel } from "./NotesFilterPanel";
import { NotesView } from "./NotesView";
import { useNotesPageUI } from "@/components/notes/hooks/useNotesPageUI";
import { TodoRightPanel } from "@/components/todos/TodoRightPanel";
import { NotePreviewContent, NotePreviewDialog } from "./NotePreviewDialog";
import { SidePanelLeft, SidePanelRight } from "@/components/common/SidePanel";
import { MetaText } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { useLiveQueryArray } from "@/hooks/useLiveQueryArray";
import { buildCapturePanelKey } from "@/components/notes/capturePanelKey";

export function NotesPage({
  filterType,
  title,
  emptyHint,
}: {
  filterType?: NoteType;
  title: string;
  emptyHint?: string;
}) {
  const notes: Note[] = useLiveQueryArray(() => db.notes.orderBy("updatedAt").reverse().toArray());
  const todos: Todo[] = useLiveQueryArray(() => db.todos.orderBy("updatedAt").reverse().toArray());
  const search = useStore((s) => s.search);
  const openCapture = useStore((s) => s.openCapture);
  const captureOpen = useStore((s) => s.captureOpen);
  const captureDefault = useStore((s) => s.captureDefault);
  const captureEditNoteId = useStore((s) => s.captureEditNoteId);
  const captureEditTodoId = useStore((s) => s.captureEditTodoId);
  const capturePrefill = useStore((s) => s.capturePrefill);
  const closeCapture = useStore((s) => s.closeCapture);
  const {
    uiState,
    uiActions,
    filtered,
    activeNote,
    currentDraft,
    previewTodo,
    setPreviewTodo,
    setEditorDraft,
    openCaptureForNotes,
    openEditFromList,
    openPreviewFromList,
    deleteFromList,
    executePendingDelete,
    filterState,
    filterActions,
  } = useNotesPageUI({
    notes,
    todos,
    search,
    filterType,
    openCapture,
    closeCapture,
    onDeleteNote: removeNote,
    onDeleteTodo: removeTodo,
  });

  let rightPanelContent: React.ReactNode = (
    <SidePanelRight title="Preview">
      <MetaText>Select a note to preview or edit details.</MetaText>
    </SidePanelRight>
  );

  const hasActiveNote = activeNote !== null;
  if (hasActiveNote) {
    rightPanelContent = (
      <NotesRightPanel
        activeNote={activeNote}
        draft={currentDraft}
        panelMode={uiState.panelMode}
        setDraft={setEditorDraft}
        onStartEdit={() => {
          uiActions.openEdit(activeNote);
        }}
        onSave={async () => {
          if (!currentDraft) return;
          await saveNote(currentDraft);
          uiActions.openPreview(currentDraft);
        }}
        onClose={() => {
          uiActions.clearSelection();
          closeCapture();
        }}
      />
    );
  }

  if (previewTodo) {
    rightPanelContent = (
      <TodoRightPanel
        todo={previewTodo}
        onClose={() => setPreviewTodo(null)}
        onEdit={() => {
          setPreviewTodo(null);
          openCapture({ todo: previewTodo });
        }}
      />
    );
  }

  if (captureOpen) {
    const capturePanelKey = buildCapturePanelKey({
      captureDefault,
      capturePrefill,
      captureEditNoteId,
      captureEditTodoId,
    });

    rightPanelContent = <NotesCreatePanel key={capturePanelKey} defaultNoteType={filterType} />;
  }

  let deleteDescription = "Delete this item?";
  let deleteTitle = "Delete item";
  if (uiState.pendingDelete) {
    const isTodoPendingDelete = uiState.pendingDelete.id.startsWith("todo:");
    if (isTodoPendingDelete) {
      deleteTitle = "Delete todo";
      deleteDescription = `Delete todo "${uiState.pendingDelete.title}"? This cannot be undone.`;
    }
    if (!isTodoPendingDelete) {
      deleteTitle = "Delete note";
      deleteDescription = `Delete note "${uiState.pendingDelete.title}"? This cannot be undone.`;
    }
  }

  let entryLabel = "entries";
  if (filtered.length === 1) {
    entryLabel = "entry";
  }

  return (
    <>
      <PageLayout variant="panel" mobileDrawerOpen={captureOpen} mobileDrawerSide="right">
        <PageLayout.Left>
          <SidePanelLeft title={title} subtitle={`${filtered.length} ${entryLabel}`}>
            <NotesFilterPanel filters={filterState} actions={filterActions} />
          </SidePanelLeft>
        </PageLayout.Left>
        <PageLayout.Middle>
          <NotesView
            emptyHint={emptyHint}
            filtered={filtered}
            openCapture={openCaptureForNotes}
            onOpenEdit={openEditFromList}
            onOpenPreview={openPreviewFromList}
            onDelete={deleteFromList}
          />
        </PageLayout.Middle>
        <PageLayout.Right>{rightPanelContent}</PageLayout.Right>
      </PageLayout>

      <Dialog
        open={!!uiState.pendingDelete}
        onOpenChange={(open) => !open && uiActions.setPendingDelete(null)}
      >
        <DialogContent variant="compact">
          <DialogHeader>
            <DialogTitle>{deleteTitle}</DialogTitle>
            <DialogDescription>{deleteDescription}</DialogDescription>
          </DialogHeader>
          <Inline gap="2" justify="end">
            <Button variant="ghost" onClick={() => uiActions.setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                void executePendingDelete();
              }}
            >
              Delete
            </Button>
          </Inline>
        </DialogContent>
      </Dialog>
    </>
  );
}

function NotesRightPanel({
  activeNote,
  draft,
  panelMode,
  setDraft,
  onStartEdit,
  onSave,
  onClose,
}: {
  activeNote: Note | null;
  draft: Note | null;
  panelMode: "edit" | "preview";
  setDraft: React.Dispatch<React.SetStateAction<Note>>;
  onStartEdit: () => void;
  onSave: () => Promise<void>;
  onClose: () => void;
}) {
  const [previewExpanded, setPreviewExpanded] = useState(false);

  if (!activeNote) {
    return null;
  }

  if (panelMode === "edit") {
    return (
      <SidePanelRight
        title="Edit note"
        textSize="h2"
        onClose={onClose}
        panelKey={`note-edit:${activeNote.id}`}
        headerActions={
          <Button
            variant="brass"
            size="sm"
            onClick={() => {
              void onSave();
            }}
          >
            <Save className="h-3.5 w-3.5" />
            Save
          </Button>
        }
      >
        <NotesEditorPanel draft={draft ?? activeNote} setDraft={setDraft} onSave={onSave} />
      </SidePanelRight>
    );
  }

  const subtitle = [
    activeNote.type,
    activeNote.date,
    `Created ${new Date(activeNote.createdAt).toLocaleDateString()}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const previewHeaderActions = (
    <Button
      variant="ghost"
      size="icon"
      onClick={onStartEdit}
      title="Edit note"
      aria-label="Edit note"
    >
      <PenLine className="h-4 w-4" />
    </Button>
  );

  return (
    <SidePanelRight
      title={activeNote.title}
      subtitle={subtitle}
      panelKey={`note-preview:${activeNote.id}`}
      onClose={onClose}
      onExpand={() => setPreviewExpanded(true)}
      headerActions={previewHeaderActions}
      expandDialog={
        <NotePreviewDialog note={activeNote} open={previewExpanded} onOpenChange={setPreviewExpanded} />
      }
    >
      <Stack gap="2" variant="dialog-scroll-body">
        <NotePreviewContent note={activeNote} />
      </Stack>
    </SidePanelRight>
  );
}

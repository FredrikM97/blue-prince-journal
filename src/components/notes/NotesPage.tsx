import { useState } from "react";
import { useStore } from "@/data/store";
import { db } from "@/data/db";
import { saveNote, removeNote, removeTodo } from "@/data/mutations";
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
import { useNotesPageUI } from "@/hooks/useNotesPageUI";
import { TodoRightPanel } from "@/components/todos/TodoRightPanel";
import { NotePreviewContent, NotePreviewDialog } from "./NotePreviewDialog";
import { SidePanel } from "@/components/common/SidePanel";
import { MetaText } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";
import { useLiveQueryArray } from "@/hooks/useLiveQueryArray";

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
    filterState,
    filterActions,
  } = useNotesPageUI({
    notes,
    todos,
    search,
    filterType,
    openCapture,
    closeCapture,
    removeTodo,
  });

  let rightPanelContent: React.ReactNode = (
    <SidePanel.Right title="Preview">
      <MetaText>Select a note to preview or edit details.</MetaText>
    </SidePanel.Right>
  );

  const hasActiveNote = activeNote !== null;
  if (hasActiveNote) {
    rightPanelContent = (
      <NotesRightPanel
        activeNote={activeNote}
        draft={currentDraft}
        panelMode={uiState.panelMode}
        setDraft={setEditorDraft}
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
    rightPanelContent = <TodoRightPanel todo={previewTodo} onClose={() => setPreviewTodo(null)} />;
  }

  if (captureOpen) {
    rightPanelContent = <NotesCreatePanel defaultNoteType={filterType} />;
  }

  let deleteDescription = "Delete this note?";
  if (uiState.pendingDelete) {
    deleteDescription = `Delete "${uiState.pendingDelete.title}"? This cannot be undone.`;
  }

  let entryLabel = "entries";
  if (filtered.length === 1) {
    entryLabel = "entry";
  }

  return (
    <>
      <PageLayout variant="panel" mobileDrawerOpen={captureOpen} mobileDrawerSide="right">
        <PageLayout.Left>
          <SidePanel.Left title={title} subtitle={`${filtered.length} ${entryLabel}`}>
            <NotesFilterPanel filters={filterState} actions={filterActions} />
          </SidePanel.Left>
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
            <DialogTitle>Delete note</DialogTitle>
            <DialogDescription>{deleteDescription}</DialogDescription>
          </DialogHeader>
          <Inline gap="2" justify="end">
            <Button variant="ghost" onClick={() => uiActions.setPendingDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                const pendingDelete = uiState.pendingDelete;
                if (!pendingDelete) return;
                await removeNote(pendingDelete.id);
                uiActions.clearDeletedIfActive(pendingDelete.id);
                uiActions.setPendingDelete(null);
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
  onSave,
  onClose,
}: {
  activeNote: Note | null;
  draft: Note | null;
  panelMode: "edit" | "preview";
  setDraft: React.Dispatch<React.SetStateAction<Note>>;
  onSave: () => Promise<void>;
  onClose: () => void;
}) {
  const [previewExpanded, setPreviewExpanded] = useState(false);

  if (!activeNote) {
    return null;
  }

  if (panelMode === "edit") {
    return (
      <SidePanel.Right title="Edit note" onClose={onClose} panelKey={`note-edit:${activeNote.id}`}>
        <NotesEditorPanel
          draft={draft ?? activeNote}
          setDraft={setDraft}
          onSave={onSave}
          onCancel={onClose}
        />
      </SidePanel.Right>
    );
  }

  const subtitle = [
    activeNote.type,
    activeNote.date,
    `Created ${new Date(activeNote.createdAt).toLocaleDateString()}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <SidePanel.Right
      title={activeNote.title}
      subtitle={subtitle}
      onExpand={() => setPreviewExpanded(true)}
      onClose={onClose}
      panelKey={`note-preview:${activeNote.id}`}
      expandDialog={
        <NotePreviewDialog
          note={activeNote}
          open={previewExpanded}
          onOpenChange={setPreviewExpanded}
        />
      }
    >
      <NotePreviewContent note={activeNote} />
    </SidePanel.Right>
  );
}

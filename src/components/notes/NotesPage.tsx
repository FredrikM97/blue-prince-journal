import { useState } from "react";
import { useStore } from "@/data/store";
import type { Note, NoteType } from "@/lib/types";
import { PageLayout } from "@/components/common/PageLayout";
import { Button, GhostButton } from "@/components/common/Button";
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

export function NotesPage({
  filterType,
  title,
  emptyHint,
}: {
  filterType?: NoteType;
  title: string;
  emptyHint?: string;
}) {
  const notes = useStore((s) => s.notes);
  const todos = useStore((s) => s.todos);
  const search = useStore((s) => s.search);
  const openCapture = useStore((s) => s.openCapture);
  const captureOpen = useStore((s) => s.captureOpen);
  const closeCapture = useStore((s) => s.closeCapture);
  const saveNote = useStore((s) => s.saveNote);
  const removeNote = useStore((s) => s.removeNote);
  const removeTodo = useStore((s) => s.removeTodo);
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

  let rightPanelContent = (
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
      <PageLayout
        className="lg:[grid-template-columns:240px_minmax(0,1fr)_420px]"
        prioritizeMiddleScroll
      >
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
        <PageLayout.Right>
          <div className="notes-right-panel-shell">{rightPanelContent}</div>
        </PageLayout.Right>
      </PageLayout>

      <Dialog
        open={!!uiState.pendingDelete}
        onOpenChange={(open) => !open && uiActions.setPendingDelete(null)}
      >
        <DialogContent variant="compact">
          <DialogHeader>
            <DialogTitle className="font-serif">Delete note</DialogTitle>
            <DialogDescription>{deleteDescription}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <GhostButton onClick={() => uiActions.setPendingDelete(null)}>Cancel</GhostButton>
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
          </div>
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
    return (
      <div className="page-layout-panel text-muted-foreground">
        Select a note to preview or edit details.
      </div>
    );
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

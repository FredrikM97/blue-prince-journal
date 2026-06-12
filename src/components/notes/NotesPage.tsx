import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PenLine, Save } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { hideNote, saveNote, removeNote, unhideNote } from "@/data/mutations/noteMutations";
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
import { TodoPreviewDialog } from "@/components/todos/TodoPreviewDialog";
import { NotePreviewContent, NotePreviewDialog } from "./NotePreviewDialog";
import { SidePanelLeft, SidePanelRight } from "@/components/common/SidePanel";
import { MetaText } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { useAppData } from "@/hooks/useAppData";
import { buildCapturePanelKey } from "@/components/notes/capturePanelKey";
import { usePageLayoutMobileDrawerProps } from "@/hooks/usePageLayoutMobileDrawer";

type ExpandedPreviewState =
  | { kind: "none" }
  | { kind: "note"; note: Note }
  | { kind: "todo"; todo: Todo };

function getNotesMobileDrawerKey({
  captureOpen,
  captureDefault,
  captureEditNoteId,
  captureEditTodoId,
  previewTodoId,
  activeNoteId,
  panelMode,
}: {
  captureOpen: boolean;
  captureDefault: "note" | "todo";
  captureEditNoteId?: string;
  captureEditTodoId?: string;
  previewTodoId: string | null;
  activeNoteId: string | null;
  panelMode: "edit" | "preview";
}) {
  if (captureOpen) {
    if (captureEditNoteId) {
      return `capture:edit-note:${captureEditNoteId}`;
    }
    if (captureEditTodoId) {
      return `capture:edit-todo:${captureEditTodoId}`;
    }
    return `capture:new:${captureDefault}`;
  }
  if (previewTodoId) {
    return `todo:${previewTodoId}`;
  }
  if (activeNoteId) {
    return `${panelMode}:${activeNoteId}`;
  }
  return false;
}

export function NotesPage({
  filterType,
  title,
  emptyHint,
}: {
  filterType?: NoteType;
  title: string;
  emptyHint?: string;
}) {
  const [expandedPreview, setExpandedPreview] = useState<ExpandedPreviewState>({ kind: "none" });
  const { notes, todos, notesLoading, todosLoading } = useAppData();
  const isPageDataLoading = notesLoading || todosLoading;
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
    setEditorDraft,
    openCaptureForNotes,
    openEditFromList,
    openPreviewFromList,
    openPreviewAfterCreate,
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

  const latestDraftRef = useRef<Note | null>(null);

  useEffect(() => {
    latestDraftRef.current = currentDraft;
  }, [currentDraft]);

  const handleStartEditActiveNote = useCallback(() => {
    if (!activeNote) return;
    uiActions.openEdit(activeNote);
  }, [activeNote, uiActions]);

  const handleSaveActiveNote = useCallback(async () => {
    const draftToSave = latestDraftRef.current;
    if (!draftToSave) return;
    await saveNote(draftToSave);
    uiActions.openPreview(draftToSave);
  }, [uiActions]);

  const handleHideActiveNote = useCallback(async () => {
    if (!activeNote || activeNote.id.startsWith("todo:")) return;
    await hideNote(activeNote.id);
    uiActions.clearSelection();
    closeCapture();
  }, [activeNote, closeCapture, uiActions]);

  const handleUnhideActiveNote = useCallback(async () => {
    if (!activeNote || activeNote.id.startsWith("todo:")) return;
    await unhideNote(activeNote.id);
  }, [activeNote]);

  const handleCloseActivePanel = useCallback(() => {
    uiActions.clearSelection();
    closeCapture();
  }, [closeCapture, uiActions]);

  const handleCloseTodoPreviewPanel = useCallback(() => {
    uiActions.setPreviewTodoId(null);
  }, [uiActions]);

  const handleEditTodoFromPreviewPanel = useCallback(() => {
    if (!previewTodo) return;
    uiActions.setPreviewTodoId(null);
    openCapture({ todo: previewTodo });
  }, [openCapture, previewTodo, uiActions]);

  const handleTodoEditSaved = useCallback(
    async (todo: Todo) => {
      closeCapture();
      uiActions.clearSelection();
      uiActions.setPreviewTodoId(todo.id);
    },
    [closeCapture, uiActions],
  );

  const handleExpandedPreviewOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setExpandedPreview({ kind: "none" });
    }
  }, []);

  const handlePendingDeleteOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        uiActions.setPendingDelete(null);
      }
    },
    [uiActions],
  );

  const handleCancelPendingDelete = useCallback(() => {
    uiActions.setPendingDelete(null);
  }, [uiActions]);

  const handleConfirmPendingDelete = useCallback(() => {
    void executePendingDelete();
  }, [executePendingDelete]);

  const handleExpandPreview = useCallback((note: Note) => {
    setExpandedPreview({ kind: "note", note });
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (/input|textarea|select/i.test(target.tagName) || (target as HTMLElement).isContentEditable);

      // Ctrl+S — save active note (works from any context)
      if (e.ctrlKey && !e.metaKey && !e.altKey && e.code === "KeyS") {
        e.preventDefault();
        void handleSaveActiveNote();
        return;
      }

      if (typing || captureOpen) return;

      // ArrowUp/ArrowDown — navigate between filtered notes
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (filtered.length === 0) return;
        e.preventDefault();
        const activeIndex = activeNote
          ? filtered.findIndex((n) => n.id === activeNote.id)
          : -1;
        const offset = e.key === "ArrowUp" ? -1 : 1;
        const next =
          activeIndex < 0
            ? filtered[0]
            : filtered[(activeIndex + offset + filtered.length) % filtered.length];
        if (next) openPreviewFromList(next);
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [activeNote, captureOpen, filtered, handleSaveActiveNote, openPreviewFromList]);

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
        onStartEdit={handleStartEditActiveNote}
        onSave={handleSaveActiveNote}
        onHide={handleHideActiveNote}
        onUnhide={handleUnhideActiveNote}
        onClose={handleCloseActivePanel}
        onExpandPreview={handleExpandPreview}
      />
    );
  }

  if (previewTodo) {
    rightPanelContent = (
      <TodoRightPanel
        todo={previewTodo}
        onClose={handleCloseTodoPreviewPanel}
        onEdit={handleEditTodoFromPreviewPanel}
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

      rightPanelContent = (
        <NotesCreatePanel
          key={capturePanelKey}
          defaultNoteType={filterType}
          onEditSaved={openPreviewAfterCreate}
          onTodoEditSaved={handleTodoEditSaved}
        />
      );
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

  const todoById = useMemo(() => {
    return new Map(todos.map((todo) => [todo.id, todo]));
  }, [todos]);

  const handleOpenExpand = useCallback(
    (note: Note) => {
      closeCapture();
      uiActions.setPreviewTodoId(null);

      if (note.id.startsWith("todo:")) {
        const todoId = note.id.slice(5);
        if (!todoId) return;
        const todo = todoById.get(todoId);
        if (!todo) return;
        setExpandedPreview({ kind: "todo", todo });
        return;
      }

      setExpandedPreview({ kind: "note", note });
    },
    [closeCapture, todoById, uiActions],
  );

  const mobileDrawerOpenSignal = getNotesMobileDrawerKey({
    captureOpen,
    captureDefault,
    captureEditNoteId: captureEditNoteId ?? undefined,
    captureEditTodoId: captureEditTodoId ?? undefined,
    previewTodoId: previewTodo?.id ?? null,
    activeNoteId: activeNote?.id ?? null,
    panelMode: uiState.panelMode,
  });
  const mobileDrawerProps = usePageLayoutMobileDrawerProps({ mobileDrawerOpen: mobileDrawerOpenSignal });

  return (
    <>
      <PageLayout variant="panel" {...mobileDrawerProps}>
        <PageLayout.Left>
          <SidePanelLeft title={title} subtitle={`${filtered.length} ${entryLabel}`}>
            <Stack gap="0" className="min-h-0 flex-1 overflow-y-auto">
              <NotesFilterPanel filters={filterState} actions={filterActions} />
            </Stack>
          </SidePanelLeft>
        </PageLayout.Left>
        <PageLayout.Middle>
          <NotesView
            emptyHint={emptyHint}
            loading={isPageDataLoading}
            filtered={filtered}
            openCapture={openCaptureForNotes}
            onOpenEdit={openEditFromList}
            onOpenPreview={openPreviewFromList}
            onOpenExpand={handleOpenExpand}
            onDelete={deleteFromList}
          />
        </PageLayout.Middle>
        <PageLayout.Right>{rightPanelContent}</PageLayout.Right>
      </PageLayout>

      {expandedPreview.kind === "note" ? (
        <NotePreviewDialog
          note={expandedPreview.note}
          open
          onOpenChange={handleExpandedPreviewOpenChange}
        />
      ) : null}

      {expandedPreview.kind === "todo" ? (
        <TodoPreviewDialog
          todo={expandedPreview.todo}
          open
          onOpenChange={handleExpandedPreviewOpenChange}
        />
      ) : null}

      {uiState.pendingDelete ? (
        <Dialog open onOpenChange={handlePendingDeleteOpenChange}>
          <DialogContent variant="compact">
            <DialogHeader>
              <DialogTitle>{deleteTitle}</DialogTitle>
              <DialogDescription>{deleteDescription}</DialogDescription>
            </DialogHeader>
            <Inline gap="2" justify="end">
              <Button variant="ghost" onClick={handleCancelPendingDelete}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleConfirmPendingDelete}>
                Delete
              </Button>
            </Inline>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

const NotesRightPanel = memo(function NotesRightPanel({
  activeNote,
  draft,
  panelMode,
  setDraft,
  onStartEdit,
  onSave,
  onHide,
  onUnhide,
  onClose,
  onExpandPreview,
}: {
  activeNote: Note | null;
  draft: Note | null;
  panelMode: "edit" | "preview";
  setDraft: React.Dispatch<React.SetStateAction<Note>>;
  onStartEdit: () => void;
  onSave: () => Promise<void>;
  onHide: () => Promise<void>;
  onUnhide: () => Promise<void>;
  onClose: () => void;
  onExpandPreview: (note: Note) => void;
}) {
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
          <Inline gap="2" align="center" justify="end">
            {activeNote.hidden ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void onUnhide();
                }}
              >
                Unhide
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  void onHide();
                }}
              >
                Hide
              </Button>
            )}
            <Button
              type="button"
              variant="brass"
              size="sm"
              onClick={() => {
                void onSave();
              }}
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </Inline>
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
      onExpand={() => onExpandPreview(activeNote)}
      headerActions={previewHeaderActions}
    >
      <Stack gap="2" variant="dialog-scroll-body">
        <NotePreviewContent note={activeNote} />
      </Stack>
    </SidePanelRight>
  );
});

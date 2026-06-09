import { useCallback, useDeferredValue, useMemo, useState } from "react";
import type { Note, NoteType, Todo } from "@/lib/types";
import { useNotesPageData } from "@/components/notes/hooks/useNotesPageData";
import { useNotesPageState } from "@/components/notes/hooks/useNotesPageState";

export type NotesFilterState = {
  filterType?: NoteType;
  typeFilter: NoteType | null;
  statusFilter: "open" | "solved" | null;
  roomFilters: string[];
  tagFilter: string | null;
  rooms: string[];
  tags: string[];
};

export type NotesFilterActions = {
  setTypeFilter: (value: NoteType | null) => void;
  setStatusFilter: (value: "open" | "solved" | null) => void;
  setRoomFilters: (value: string[]) => void;
  setTagFilter: (value: string | null) => void;
};

export function useNotesPageUI({
  notes,
  todos,
  search,
  filterType,
  openCapture,
  closeCapture,
  onDeleteNote,
  onDeleteTodo,
}: {
  notes: Note[];
  todos: Todo[];
  search: string;
  filterType?: NoteType;
  openCapture: (opts?: {
    kind?: "note" | "todo";
    prefill?: string;
    room?: string;
    noteType?: NoteType;
    note?: Note;
    todo?: Todo;
    returnTo?: string;
  }) => void;
  closeCapture: () => void;
  onDeleteNote: (noteId: string) => Promise<void>;
  onDeleteTodo: (todoId: string) => Promise<void>;
}) {
  const deferredSearch = useDeferredValue(search);
  const { state: uiState, actions: uiActions } = useNotesPageState();
  const [previewTodo, setPreviewTodo] = useState<Todo | null>(null);

  const effectiveType = filterType ?? uiState.typeFilter;

  const todoByVirtualId = useMemo(() => {
    const index = new Map<string, Todo>();
    todos.forEach((todo) => {
      index.set(`todo:${todo.id}`, todo);
    });
    return index;
  }, [todos]);

  const resolveTodoForListItem = useCallback(
    (note: Note) => {
      const directMatch = todoByVirtualId.get(note.id);
      if (directMatch) return directMatch;

      if (!note.id.startsWith("todo:")) return null;
      const todoId = note.id.slice(5);
      if (!todoId) return null;

      const fallbackMatch = todos.find((todo) => todo.id === todoId);
      if (!fallbackMatch) return null;
      return fallbackMatch;
    },
    [todoByVirtualId, todos],
  );

  const { filtered, rooms, tags } = useNotesPageData({
    notes,
    todos,
    search: deferredSearch,
    filterType: effectiveType ?? undefined,
    roomFilters: uiState.roomFilters,
    tagFilter: uiState.tagFilter,
    statusFilter: uiState.statusFilter,
  });

  const activeNote = useMemo(
    () => notes.find((note) => note.id === uiState.activeNoteId) ?? null,
    [notes, uiState.activeNoteId],
  );

  const currentDraft = useMemo(() => {
    if (!activeNote) return null;
    if (uiState.draft && uiState.draft.id === activeNote.id) return uiState.draft;
    return activeNote;
  }, [activeNote, uiState.draft]);

  const setEditorDraft: React.Dispatch<React.SetStateAction<Note>> = (next) => {
    const base = uiState.draft ?? activeNote;
    if (!base) return;
    const resolved = typeof next === "function" ? next(base) : next;
    uiActions.setDraft(resolved);
  };

  const openCaptureForNotes = useCallback(() => {
    uiActions.clearSelection();
    setPreviewTodo(null);
    openCapture({ kind: "note", noteType: filterType });
  }, [filterType, openCapture, uiActions]);

  const openEditFromList = useCallback(
    (note: Note) => {
      const todo = resolveTodoForListItem(note);
      if (todo) {
        uiActions.clearSelection();
        setPreviewTodo(null);
        openCapture({ todo });
        return;
      }
      setPreviewTodo(null);
      closeCapture();
      uiActions.openEdit(note);
    },
    [closeCapture, openCapture, resolveTodoForListItem, uiActions],
  );

  const openPreviewFromList = useCallback(
    (note: Note) => {
      const todo = resolveTodoForListItem(note);
      if (todo) {
        uiActions.clearSelection();
        closeCapture();
        setPreviewTodo(todo);
        return;
      }
      setPreviewTodo(null);
      closeCapture();
      uiActions.openPreview(note);
    },
    [closeCapture, resolveTodoForListItem, uiActions],
  );

  const deleteFromList = useCallback(
    (note: Note) => {
      uiActions.setPendingDelete(note);
    },
    [uiActions],
  );

  const executePendingDelete = useCallback(async () => {
    const pendingDelete = uiState.pendingDelete;
    if (!pendingDelete) return;

    if (pendingDelete.id.startsWith("todo:")) {
      const todoId = pendingDelete.id.slice(5);
      if (todoId) {
        await onDeleteTodo(todoId);
      }
    } else {
      await onDeleteNote(pendingDelete.id);
    }

    uiActions.clearDeletedIfActive(pendingDelete.id);
    uiActions.setPendingDelete(null);
  }, [onDeleteNote, onDeleteTodo, uiActions, uiState.pendingDelete]);

  const filterState: NotesFilterState = {
    filterType,
    typeFilter: uiState.typeFilter,
    statusFilter: uiState.statusFilter,
    roomFilters: uiState.roomFilters,
    tagFilter: uiState.tagFilter,
    rooms,
    tags,
  };

  const filterActions: NotesFilterActions = {
    setTypeFilter: uiActions.setTypeFilter,
    setStatusFilter: uiActions.setStatusFilter,
    setRoomFilters: uiActions.setRoomFilters,
    setTagFilter: uiActions.setTagFilter,
  };

  return {
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
  };
}

import { useCallback, useDeferredValue, useMemo, useState } from "react";
import type { Note, NoteType, Todo } from "@/lib/types";
import { useNotesPageData } from "@/hooks/useNotesPageData";
import { useNotesPageState } from "@/hooks/useNotesPageState";

export type NotesFilterState = {
  filterType?: NoteType;
  typeFilter: NoteType | null;
  statusFilter: "open" | "solved" | null;
  roomFilter: string | null;
  tagFilter: string | null;
  rooms: string[];
  tags: string[];
};

export type NotesFilterActions = {
  setTypeFilter: (value: NoteType | null) => void;
  setStatusFilter: (value: "open" | "solved" | null) => void;
  setRoomFilter: (value: string | null) => void;
  setTagFilter: (value: string | null) => void;
};

export function useNotesPageUI({
  notes,
  todos,
  search,
  filterType,
  openCapture,
  closeCapture,
  removeTodo,
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
  removeTodo: (id: string) => Promise<void>;
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

  const { filtered, rooms, tags } = useNotesPageData({
    notes,
    todos,
    search: deferredSearch,
    filterType: effectiveType ?? undefined,
    roomFilter: uiState.roomFilter,
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
      const todo = todoByVirtualId.get(note.id);
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
    [closeCapture, openCapture, todoByVirtualId, uiActions],
  );

  const openPreviewFromList = useCallback(
    (note: Note) => {
      const todo = todoByVirtualId.get(note.id);
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
    [closeCapture, todoByVirtualId, uiActions],
  );

  const deleteFromList = useCallback(
    (note: Note) => {
      const todo = todoByVirtualId.get(note.id);
      if (todo) {
        void removeTodo(todo.id);
        return;
      }
      uiActions.setPendingDelete(note);
    },
    [removeTodo, todoByVirtualId, uiActions],
  );

  const filterState: NotesFilterState = {
    filterType,
    typeFilter: uiState.typeFilter,
    statusFilter: uiState.statusFilter,
    roomFilter: uiState.roomFilter,
    tagFilter: uiState.tagFilter,
    rooms,
    tags,
  };

  const filterActions: NotesFilterActions = {
    setTypeFilter: uiActions.setTypeFilter,
    setStatusFilter: uiActions.setStatusFilter,
    setRoomFilter: uiActions.setRoomFilter,
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
    filterState,
    filterActions,
  };
}

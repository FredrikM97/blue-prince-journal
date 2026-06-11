import { useCallback, useDeferredValue, useEffect, useMemo, useReducer, useRef } from "react";
import type { Note, NoteType, Todo } from "@/lib/types";
import { buildNoteListItems, buildRooms, buildTags, filterNotesList } from "@/domain/notesPage";

interface NotesPageUiState {
  typeFilter: NoteType | null;
  roomFilters: string[];
  tagFilter: string | null;
  statusFilter: "open" | "solved" | null;
  showHiddenFilter: boolean;
  activeNoteId: string | null;
  previewTodoId: string | null;
  panelMode: "edit" | "preview";
  draft: Note | null;
  pendingDelete: Note | null;
}

type NotesPageAction =
  | { type: "setTypeFilter"; value: NoteType | null }
  | { type: "setRoomFilters"; value: string[] }
  | { type: "setTagFilter"; value: string | null }
  | { type: "setStatusFilter"; value: "open" | "solved" | null }
  | { type: "setShowHiddenFilter"; value: boolean }
  | { type: "setPreviewTodoId"; value: string | null }
  | { type: "openEdit"; note: Note }
  | { type: "openPreview"; note: Note }
  | { type: "clearSelection" }
  | { type: "setDraft"; value: Note | null }
  | { type: "setPendingDelete"; value: Note | null }
  | { type: "clearDeletedIfActive"; noteId: string };

const INITIAL_UI_STATE: NotesPageUiState = {
  typeFilter: null,
  roomFilters: [],
  tagFilter: null,
  statusFilter: "open",
  showHiddenFilter: false,
  activeNoteId: null,
  previewTodoId: null,
  panelMode: "edit",
  draft: null,
  pendingDelete: null,
};

function notesPageReducer(state: NotesPageUiState, action: NotesPageAction): NotesPageUiState {
  function hasSameRoomFilters(next: string[]): boolean {
    if (state.roomFilters.length !== next.length) return false;
    return state.roomFilters.every((room, index) => room === next[index]);
  }

  switch (action.type) {
    case "setTypeFilter":
      return state.typeFilter === action.value ? state : { ...state, typeFilter: action.value };
    case "setRoomFilters":
      return hasSameRoomFilters(action.value) ? state : { ...state, roomFilters: action.value };
    case "setTagFilter":
      return state.tagFilter === action.value ? state : { ...state, tagFilter: action.value };
    case "setStatusFilter":
      return state.statusFilter === action.value ? state : { ...state, statusFilter: action.value };
    case "setShowHiddenFilter":
      return state.showHiddenFilter === action.value
        ? state
        : { ...state, showHiddenFilter: action.value };
    case "setPreviewTodoId":
      return state.previewTodoId === action.value ? state : { ...state, previewTodoId: action.value };
    case "openEdit":
      if (
        state.panelMode === "edit" &&
        state.activeNoteId === action.note.id &&
        state.draft === action.note
      ) {
        return state;
      }
      return {
        ...state,
        panelMode: "edit",
        activeNoteId: action.note.id,
        draft: action.note,
      };
    case "openPreview":
      if (
        state.panelMode === "preview" &&
        state.activeNoteId === action.note.id &&
        state.draft === action.note
      ) {
        return state;
      }
      return {
        ...state,
        panelMode: "preview",
        activeNoteId: action.note.id,
        draft: action.note,
      };
    case "clearSelection":
      return state.activeNoteId === null && state.draft === null
        ? state
        : { ...state, activeNoteId: null, draft: null };
    case "setDraft":
      return state.draft === action.value ? state : { ...state, draft: action.value };
    case "setPendingDelete":
      return state.pendingDelete === action.value
        ? state
        : { ...state, pendingDelete: action.value };
    case "clearDeletedIfActive":
      return state.activeNoteId === action.noteId ? { ...state, activeNoteId: null } : state;
    default:
      return state;
  }
}

function useNotesPageState() {
  const [state, dispatch] = useReducer(notesPageReducer, INITIAL_UI_STATE);

  const setTypeFilter = useCallback(
    (value: NoteType | null) => dispatch({ type: "setTypeFilter", value }),
    [],
  );
  const setRoomFilters = useCallback(
    (value: string[]) => dispatch({ type: "setRoomFilters", value }),
    [],
  );
  const setTagFilter = useCallback(
    (value: string | null) => dispatch({ type: "setTagFilter", value }),
    [],
  );
  const setStatusFilter = useCallback(
    (value: "open" | "solved" | null) => dispatch({ type: "setStatusFilter", value }),
    [],
  );
  const setShowHiddenFilter = useCallback(
    (value: boolean) => dispatch({ type: "setShowHiddenFilter", value }),
    [],
  );
  const setPreviewTodoId = useCallback(
    (value: string | null) => dispatch({ type: "setPreviewTodoId", value }),
    [],
  );
  const openEdit = useCallback((note: Note) => dispatch({ type: "openEdit", note }), []);
  const openPreview = useCallback((note: Note) => dispatch({ type: "openPreview", note }), []);
  const clearSelection = useCallback(() => dispatch({ type: "clearSelection" }), []);
  const setDraft = useCallback((value: Note | null) => dispatch({ type: "setDraft", value }), []);
  const setPendingDelete = useCallback(
    (value: Note | null) => dispatch({ type: "setPendingDelete", value }),
    [],
  );
  const clearDeletedIfActive = useCallback(
    (noteId: string) => dispatch({ type: "clearDeletedIfActive", noteId }),
    [],
  );

  const actions = useMemo(
    () => ({
      setTypeFilter,
      setRoomFilters,
      setTagFilter,
      setStatusFilter,
      setShowHiddenFilter,
      setPreviewTodoId,
      openEdit,
      openPreview,
      clearSelection,
      setDraft,
      setPendingDelete,
      clearDeletedIfActive,
    }),
    [
      setTypeFilter,
      setRoomFilters,
      setTagFilter,
      setStatusFilter,
      setShowHiddenFilter,
      setPreviewTodoId,
      openEdit,
      openPreview,
      clearSelection,
      setDraft,
      setPendingDelete,
      clearDeletedIfActive,
    ],
  );

  return { state, actions };
}

export type NotesFilterState = {
  filterType?: NoteType;
  typeFilter: NoteType | null;
  statusFilter: "open" | "solved" | null;
  showHiddenFilter: boolean;
  roomFilters: string[];
  tagFilter: string | null;
  rooms: string[];
  tags: string[];
};

export type NotesFilterActions = {
  setTypeFilter: (value: NoteType | null) => void;
  setStatusFilter: (value: "open" | "solved" | null) => void;
  setShowHiddenFilter: (value: boolean) => void;
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

  const effectiveType = filterType ?? uiState.typeFilter;

  const todoById = useMemo(() => {
    const index = new Map<string, Todo>();
    todos.forEach((todo) => {
      index.set(todo.id, todo);
    });
    return index;
  }, [todos]);

  const todoByVirtualId = useMemo(() => {
    const index = new Map<string, Todo>();
    todoById.forEach((todo, id) => {
      index.set(`todo:${id}`, todo);
    });
    return index;
  }, [todoById]);

  const resolveTodoForListItem = useCallback(
    (note: Note) => {
      const directMatch = todoByVirtualId.get(note.id);
      if (directMatch) return directMatch;

      if (!note.id.startsWith("todo:")) return null;
      const todoId = note.id.slice(5);
      if (!todoId) return null;

      const fallbackMatch = todoById.get(todoId);
      if (!fallbackMatch) return null;
      return fallbackMatch;
    },
    [todoById, todoByVirtualId],
  );

  const noteListItems = useMemo(() => {
    return buildNoteListItems(notes, todos);
  }, [notes, todos]);

  const rooms = useMemo(() => buildRooms(noteListItems), [noteListItems]);

  const tags = useMemo(() => buildTags(noteListItems), [noteListItems]);

  const filtered = useMemo(() => {
    return filterNotesList({
      noteListItems,
      search: deferredSearch,
      filterType: effectiveType ?? undefined,
      roomFilters: uiState.roomFilters,
      tagFilter: uiState.tagFilter,
      statusFilter: uiState.statusFilter,
      showHidden: uiState.showHiddenFilter,
    });
  }, [
    deferredSearch,
    effectiveType,
    noteListItems,
    uiState.showHiddenFilter,
    uiState.roomFilters,
    uiState.statusFilter,
    uiState.tagFilter,
  ]);

  const activeNote = useMemo(
    () => notes.find((note) => note.id === uiState.activeNoteId) ?? null,
    [notes, uiState.activeNoteId],
  );

  const previewTodo = useMemo(
    () => (uiState.previewTodoId ? (todoById.get(uiState.previewTodoId) ?? null) : null),
    [todoById, uiState.previewTodoId],
  );

  const currentDraft = useMemo(() => {
    if (!activeNote) return null;
    if (uiState.draft && uiState.draft.id === activeNote.id) return uiState.draft;
    return activeNote;
  }, [activeNote, uiState.draft]);

  const draftRef = useRef<Note | null>(null);

  useEffect(() => {
    draftRef.current = currentDraft;
  }, [currentDraft]);

  const setEditorDraft = useCallback<React.Dispatch<React.SetStateAction<Note>>>(
    (next) => {
      const base = draftRef.current;
      if (!base) return;
      const resolved = typeof next === "function" ? next(base) : next;
      draftRef.current = resolved;
      uiActions.setDraft(resolved);
    },
    [uiActions],
  );

  const openCaptureForNotes = useCallback(() => {
    uiActions.clearSelection();
    uiActions.setPreviewTodoId(null);
    openCapture({ kind: "note", noteType: filterType });
  }, [filterType, openCapture, uiActions]);

  const openEditFromList = useCallback(
    (note: Note) => {
      const todo = resolveTodoForListItem(note);
      if (todo) {
        uiActions.clearSelection();
        uiActions.setPreviewTodoId(null);
        openCapture({ todo });
        return;
      }
      uiActions.setPreviewTodoId(null);
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
        uiActions.setPreviewTodoId(todo.id);
        return;
      }
      uiActions.setPreviewTodoId(null);
      closeCapture();
      uiActions.openPreview(note);
    },
    [closeCapture, resolveTodoForListItem, uiActions],
  );

  const openPreviewAfterCreate = useCallback(
    (note: Note) => {
      closeCapture();
      uiActions.setPreviewTodoId(null);
      uiActions.openPreview(note);
    },
    [closeCapture, uiActions],
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
    showHiddenFilter: uiState.showHiddenFilter,
    roomFilters: uiState.roomFilters,
    tagFilter: uiState.tagFilter,
    rooms,
    tags,
  };

  const filterActions: NotesFilterActions = {
    setTypeFilter: uiActions.setTypeFilter,
    setStatusFilter: uiActions.setStatusFilter,
    setShowHiddenFilter: uiActions.setShowHiddenFilter,
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
    setEditorDraft,
    openCaptureForNotes,
    openEditFromList,
    openPreviewFromList,
    openPreviewAfterCreate,
    deleteFromList,
    executePendingDelete,
    filterState,
    filterActions,
  };
}

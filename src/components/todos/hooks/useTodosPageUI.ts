import { useCallback, useDeferredValue, useMemo, useReducer } from "react";
import type { Todo } from "@/lib/types";
import { groupTodosByStatus } from "@/components/todos/Constants";
import { matchesSearchQuery, parseSearchQuery } from "@/lib/searchQuery";
import type { TodoStatus } from "@/lib/types";

type TodosPageUiState = {
  scopeFilter: string | null;
  previewTodoId: string | null;
  pendingDeleteTodoId: string | null;
  activeMobileStatus: TodoStatus;
};

type TodosPageAction =
  | { type: "setScopeFilter"; value: string | null }
  | { type: "setActiveMobileStatus"; value: TodoStatus }
  | { type: "openPreview"; todoId: string }
  | { type: "closePreview" }
  | { type: "requestDelete"; todoId: string }
  | { type: "clearPendingDelete" };

const INITIAL_TODOS_UI_STATE: TodosPageUiState = {
  scopeFilter: null,
  previewTodoId: null,
  pendingDeleteTodoId: null,
  activeMobileStatus: "open",
};

function todosPageReducer(state: TodosPageUiState, action: TodosPageAction): TodosPageUiState {
  switch (action.type) {
    case "setScopeFilter":
      return state.scopeFilter === action.value ? state : { ...state, scopeFilter: action.value };
    case "setActiveMobileStatus":
      return state.activeMobileStatus === action.value
        ? state
        : { ...state, activeMobileStatus: action.value };
    case "openPreview":
      return state.previewTodoId === action.todoId
        ? state
        : { ...state, previewTodoId: action.todoId };
    case "closePreview":
      return state.previewTodoId === null ? state : { ...state, previewTodoId: null };
    case "requestDelete":
      return state.pendingDeleteTodoId === action.todoId
        ? state
        : { ...state, pendingDeleteTodoId: action.todoId };
    case "clearPendingDelete":
      return state.pendingDeleteTodoId === null ? state : { ...state, pendingDeleteTodoId: null };
    default:
      return state;
  }
}

function useTodosPageState() {
  const [state, dispatch] = useReducer(todosPageReducer, INITIAL_TODOS_UI_STATE);

  const setScopeFilter = useCallback(
    (value: string | null) => dispatch({ type: "setScopeFilter", value }),
    [],
  );
  const setActiveMobileStatus = useCallback(
    (value: TodoStatus) => dispatch({ type: "setActiveMobileStatus", value }),
    [],
  );
  const openPreview = useCallback(
    (todoId: string) => dispatch({ type: "openPreview", todoId }),
    [],
  );
  const closePreview = useCallback(() => dispatch({ type: "closePreview" }), []);
  const requestDelete = useCallback(
    (todoId: string) => dispatch({ type: "requestDelete", todoId }),
    [],
  );
  const clearPendingDelete = useCallback(
    () => dispatch({ type: "clearPendingDelete" }),
    [],
  );

  const actions = useMemo(
    () => ({
      setScopeFilter,
      setActiveMobileStatus,
      openPreview,
      closePreview,
      requestDelete,
      clearPendingDelete,
    }),
    [
      setScopeFilter,
      setActiveMobileStatus,
      openPreview,
      closePreview,
      requestDelete,
      clearPendingDelete,
    ],
  );

  return { state, actions };
}

export function useTodosPageUI({ todos, search }: { todos: Todo[]; search: string }) {
  const { state: uiState, actions: uiActions } = useTodosPageState();
  const deferredSearch = useDeferredValue(search);
  const todoById = useMemo(() => new Map(todos.map((todo) => [todo.id, todo])), [todos]);

  const filtered = useMemo(() => {
    const query = parseSearchQuery(deferredSearch);
    return todos.filter((todo) => {
      if (uiState.scopeFilter && todo.scope !== uiState.scopeFilter) return false;
      if (!matchesSearchQuery(todo, query)) return false;
      return true;
    });
  }, [deferredSearch, todos, uiState.scopeFilter]);

  const grouped = useMemo(() => groupTodosByStatus(filtered), [filtered]);

  const statusCounts = useMemo(() => {
    return filtered.reduce(
      (acc, todo) => {
        if (todo.status === "open") acc.open++;
        if (todo.status === "in-progress") acc.progress++;
        if (todo.status === "done") acc.done++;
        return acc;
      },
      { open: 0, progress: 0, done: 0 },
    );
  }, [filtered]);
  const openCount = statusCounts.open;
  const progressCount = statusCounts.progress;
  const doneCount = statusCounts.done;

  const previewTodo = useMemo(
    () =>
      uiState.previewTodoId
        ? (todoById.get(uiState.previewTodoId) ?? null)
        : null,
    [todoById, uiState.previewTodoId],
  );
  const pendingDeleteTodo = useMemo(
    () =>
      uiState.pendingDeleteTodoId
        ? (todoById.get(uiState.pendingDeleteTodoId) ?? null)
        : null,
    [todoById, uiState.pendingDeleteTodoId],
  );

  return {
    uiState,
    uiActions,
    filtered,
    grouped,
    openCount,
    progressCount,
    doneCount,
    previewTodo,
    pendingDeleteTodo,
  };
}

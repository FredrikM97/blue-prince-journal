import { useCallback } from "react";
import { useStore } from "@/hooks/useStore";
import { toggleTodoStatus, removeTodo } from "@/data/mutations/todoMutations";
import type { Todo } from "@/lib/types";
import { PageLayout } from "@/components/common/PageLayout";
import { TodoLeftPanel } from "./TodoLeftPanel";
import { TodoMiddlePanel } from "./TodoMiddlePanel";
import { TodoPreviewDialog } from "./TodoPreviewDialog";
import { Button } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import { Inline } from "@/components/common/LayoutPrimitives";
import { useAppData } from "@/hooks/useAppData";
import { useTodosPageUI } from "@/components/todos/hooks/useTodosPageUI";

export function TodosPage() {
  const { todos, todosLoading: isLoading } = useAppData();
  const search = useStore((s) => s.search);
  const {
    uiState,
    uiActions,
    filtered,
    grouped,
    openCount,
    progressCount,
    doneCount,
    previewTodo,
    pendingDeleteTodo,
  } = useTodosPageUI({ todos, search });
  let deleteDescription = "Delete this todo?";
  if (pendingDeleteTodo) {
    deleteDescription = `Delete "${pendingDeleteTodo.title}"? This cannot be undone.`;
  }

  const handleToggle = useCallback((id: string, next: Todo["status"]) => {
    void toggleTodoStatus(id, next);
  }, []);

  const handleOpenPreview = useCallback(
    (todo: Todo) => {
      uiActions.openPreview(todo.id);
    },
    [uiActions],
  );

  const handlePreviewOpenChange = useCallback(
    (open: boolean) => {
      if (!open) uiActions.closePreview();
    },
    [uiActions],
  );

  const handleDeleteOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        uiActions.clearPendingDelete();
      }
    },
    [uiActions],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteTodo) return;
    await removeTodo(pendingDeleteTodo.id);
    uiActions.clearPendingDelete();
  }, [pendingDeleteTodo, uiActions]);

  return (
    <>
      <PageLayout variant="panel">
        <PageLayout.Left>
          <TodoLeftPanel
            total={filtered.length}
            openCount={openCount}
            progressCount={progressCount}
            doneCount={doneCount}
            scopeFilter={uiState.scopeFilter}
            setScopeFilter={uiActions.setScopeFilter}
          />
        </PageLayout.Left>

        <PageLayout.Middle>
          <TodoMiddlePanel
            grouped={grouped}
            loading={isLoading}
            onToggle={handleToggle}
            onDelete={uiActions.requestDelete}
            onOpenPreview={handleOpenPreview}
            activeMobileStatus={uiState.activeMobileStatus}
            onActiveMobileStatusChange={uiActions.setActiveMobileStatus}
          />
        </PageLayout.Middle>
      </PageLayout>

      {previewTodo ? (
        <TodoPreviewDialog todo={previewTodo} open onOpenChange={handlePreviewOpenChange} />
      ) : null}

      {pendingDeleteTodo ? (
        <Dialog open onOpenChange={handleDeleteOpenChange}>
          <DialogContent variant="compact">
            <DialogHeader>
              <DialogTitle>Delete todo</DialogTitle>
              <DialogDescription>{deleteDescription}</DialogDescription>
            </DialogHeader>
            <Inline gap="2" justify="end">
              <Button variant="ghost" onClick={uiActions.clearPendingDelete}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  void handleConfirmDelete();
                }}
              >
                Delete
              </Button>
            </Inline>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

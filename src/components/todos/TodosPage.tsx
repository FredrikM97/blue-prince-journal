import { useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { db } from "@/data/db";
import { toggleTodoStatus, removeTodo } from "@/data/mutations/todoMutations";
import type { Todo } from "@/lib/types";
import { groupTodosByStatus } from "@/components/todos/Constants";
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
import { useLiveQueryArray } from "@/hooks/useLiveQueryArray";
import { matchesSearchQuery, parseSearchQuery } from "@/lib/searchQuery";

export function TodosPage() {
  const todos: Todo[] = useLiveQueryArray(() => db.todos.orderBy("updatedAt").reverse().toArray());
  const search = useStore((s) => s.search);
  const toggle = toggleTodoStatus;
  const remove = removeTodo;
  const [scopeFilter, setScopeFilter] = useState<string | null>(null);
  const [previewTodoId, setPreviewTodoId] = useState<string | null>(null);
  const [pendingDeleteTodoId, setPendingDeleteTodoId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const query = parseSearchQuery(search);
    return todos.filter((t) => {
      if (scopeFilter && t.scope !== scopeFilter) return false;
      if (!matchesSearchQuery(t, query)) return false;
      return true;
    });
  }, [todos, search, scopeFilter]);

  const grouped = groupTodosByStatus(filtered);
  const openCount = filtered.filter((t) => t.status === "open").length;
  const progressCount = filtered.filter((t) => t.status === "in-progress").length;
  const doneCount = filtered.filter((t) => t.status === "done").length;

  const previewTodo = previewTodoId ? (todos.find((t) => t.id === previewTodoId) ?? null) : null;
  const pendingDeleteTodo = pendingDeleteTodoId
    ? (todos.find((t) => t.id === pendingDeleteTodoId) ?? null)
    : null;
  let deleteDescription = "Delete this todo?";
  if (pendingDeleteTodo) {
    deleteDescription = `Delete "${pendingDeleteTodo.title}"? This cannot be undone.`;
  }

  return (
    <>
      <PageLayout variant="panel">
        <PageLayout.Left>
          <TodoLeftPanel
            total={filtered.length}
            openCount={openCount}
            progressCount={progressCount}
            doneCount={doneCount}
            scopeFilter={scopeFilter}
            setScopeFilter={setScopeFilter}
          />
        </PageLayout.Left>

        <PageLayout.Middle>
          <TodoMiddlePanel
            grouped={grouped}
            onToggle={(id, next) => toggle(id, next)}
            onDelete={(id) => setPendingDeleteTodoId(id)}
            onOpenPreview={(todo) => setPreviewTodoId(todo.id)}
          />
        </PageLayout.Middle>
      </PageLayout>

      <TodoPreviewDialog
        todo={previewTodo}
        open={!!previewTodo}
        onOpenChange={(open) => {
          if (!open) setPreviewTodoId(null);
        }}
      />

      <Dialog
        open={!!pendingDeleteTodo}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteTodoId(null);
          }
        }}
      >
        <DialogContent variant="compact">
          <DialogHeader>
            <DialogTitle>Delete todo</DialogTitle>
            <DialogDescription>{deleteDescription}</DialogDescription>
          </DialogHeader>
          <Inline gap="2" justify="end">
            <Button variant="ghost" onClick={() => setPendingDeleteTodoId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!pendingDeleteTodo) return;
                await remove(pendingDeleteTodo.id);
                setPendingDeleteTodoId(null);
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

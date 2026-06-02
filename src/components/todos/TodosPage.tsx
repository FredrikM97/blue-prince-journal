import { useMemo, useState } from "react";
import { useStore } from "@/data/store";
import { groupTodosByStatus } from "@/components/todos/Constants";
import { PageLayout } from "@/components/common/PageLayout";
import { TodoLeftPanel } from "./TodoLeftPanel";
import { TodoMiddlePanel } from "./TodoMiddlePanel";
import { TodoPreviewDialog } from "./TodoPreviewDialog";

export function TodosPage() {
  const todos = useStore((s) => s.todos);
  const search = useStore((s) => s.search);
  const toggle = useStore((s) => s.toggleTodoStatus);
  const remove = useStore((s) => s.removeTodo);
  const save = useStore((s) => s.saveTodo);
  const [scopeFilter, setScopeFilter] = useState<string | null>(null);
  const [previewTodoId, setPreviewTodoId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return todos.filter((t) => {
      if (scopeFilter && t.scope !== scopeFilter) return false;
      if (q && !`${t.title} ${t.tags.join(" ")} ${t.room ?? ""}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [todos, search, scopeFilter]);

  const grouped = groupTodosByStatus(filtered);
  const openCount = filtered.filter((t) => t.status === "open").length;
  const progressCount = filtered.filter((t) => t.status === "in-progress").length;
  const doneCount = filtered.filter((t) => t.status === "done").length;

  const previewTodo = previewTodoId ? (todos.find((t) => t.id === previewTodoId) ?? null) : null;

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
            onDelete={(id) => {
              if (confirm("Delete this todo?")) remove(id);
            }}
            onEdit={save}
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
    </>
  );
}

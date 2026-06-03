import { TODO_STATUS_COLUMNS } from "./Constants";
import { TodoItem } from "./TodoItem";
import type { Todo, TodoStatus } from "@/lib/types";
import { Stack } from "@/components/common/Stack";
import { Heading, MetaText } from "@/components/common/Typography";

function TodoColumn({
  label,
  value,
  todos,
  onToggle,
  onDelete,
  onEdit,
  onOpenPreview,
}: {
  label: string;
  value: string;
  todos: Todo[];
  onToggle: (id: string, next: TodoStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (t: Todo) => void;
  onOpenPreview: (t: Todo) => void;
}) {
  return (
    <section className="todos-column">
      <header className="todos-column-header">
        <Heading as="h2" size="base" variant="section-label">
          {label}
        </Heading>
        <MetaText as="span">{todos.length}</MetaText>
      </header>
      <ul className="todos-column-list">
        {todos.length === 0 && (
          <li className="todos-column-empty">
            {value === "open" ? "Press N to add a todo" : "Empty"}
          </li>
        )}
        {todos.map((t) => (
          <TodoItem
            key={t.id}
            todo={t}
            onToggle={(next) => onToggle(t.id, next)}
            onDelete={() => onDelete(t.id)}
            onEdit={onEdit}
            onOpenPreview={() => onOpenPreview(t)}
          />
        ))}
      </ul>
    </section>
  );
}

export function TodoMiddlePanel({
  grouped,
  onToggle,
  onDelete,
  onEdit,
  onOpenPreview,
}: {
  grouped: Record<TodoStatus, Todo[]>;
  onToggle: (id: string, next: TodoStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onOpenPreview: (todo: Todo) => void;
}) {
  return (
    <Stack as="section" gap="0">
      <div className="todos-columns-grid">
        {TODO_STATUS_COLUMNS.map((col) => (
          <TodoColumn
            key={col.value}
            label={col.label}
            value={col.value}
            todos={grouped[col.value]}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            onOpenPreview={onOpenPreview}
          />
        ))}
      </div>
    </Stack>
  );
}

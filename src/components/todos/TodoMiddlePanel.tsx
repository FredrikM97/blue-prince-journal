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
  onOpenPreview,
}: {
  label: string;
  value: string;
  todos: Todo[];
  onToggle: (id: string, next: TodoStatus) => void;
  onDelete: (id: string) => void;
  onOpenPreview: (t: Todo) => void;
}) {
  return (
    <Stack as="section" gap="0" className="todos-column">
      <Stack as="header" gap="0" className="todos-column-header">
        <Heading as="h2" size="base" variant="section-label">
          {label}
        </Heading>
        <MetaText as="span">{todos.length}</MetaText>
      </Stack>
      <Stack as="ul" gap="0" className="todos-column-list">
        {todos.length === 0 && (
          <Stack as="li" gap="0" className="todos-column-empty">
            {value === "open" ? "Press N to add a todo" : "Empty"}
          </Stack>
        )}
        {todos.map((t) => (
          <TodoItem
            key={t.id}
            todo={t}
            onToggle={(next) => onToggle(t.id, next)}
            onDelete={() => onDelete(t.id)}
            onOpenPreview={() => onOpenPreview(t)}
          />
        ))}
      </Stack>
    </Stack>
  );
}

export function TodoMiddlePanel({
  grouped,
  onToggle,
  onDelete,
  onOpenPreview,
}: {
  grouped: Record<TodoStatus, Todo[]>;
  onToggle: (id: string, next: TodoStatus) => void;
  onDelete: (id: string) => void;
  onOpenPreview: (todo: Todo) => void;
}) {
  return (
    <Stack as="section" gap="0">
      <Stack as="div" gap="0" className="todos-columns-grid">
        {TODO_STATUS_COLUMNS.map((col) => (
          <TodoColumn
            key={col.value}
            label={col.label}
            value={col.value}
            todos={grouped[col.value]}
            onToggle={onToggle}
            onDelete={onDelete}
            onOpenPreview={onOpenPreview}
          />
        ))}
      </Stack>
    </Stack>
  );
}

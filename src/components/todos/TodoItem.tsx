import { useState } from "react";
import type { Todo, TodoStatus } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { Maximize2, Trash2 } from "lucide-react";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { todoPriorityClass } from "./Constants";

const TODO_STATUS_OPTIONS = [
  { value: "open", label: "open" },
  { value: "in-progress", label: "in progress" },
  { value: "done", label: "done" },
];

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onEdit,
  onOpenPreview,
}: {
  todo: Todo;
  onToggle: (s: TodoStatus) => void;
  onDelete: () => void;
  onEdit: (t: Todo) => void;
  onOpenPreview: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);

  return (
    <li className="todo-row-item">
      <input
        type="checkbox"
        className="mt-1"
        checked={todo.status === "done"}
        onChange={(e) => onToggle(e.target.checked ? "done" : "open")}
      />
      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              setEditing(false);
              if (title.trim() && title !== todo.title) onEdit({ ...todo, title: title.trim() });
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
              if (e.key === "Escape") {
                setTitle(todo.title);
                setEditing(false);
              }
            }}
            className="input-base h-7"
          />
        ) : (
          <button
            className={`text-left text-sm ${
              todo.status === "done" ? "text-muted-foreground line-through" : ""
            }`}
            onDoubleClick={() => setEditing(true)}
          >
            {todo.title}
          </button>
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span className={todoPriorityClass(todo.priority)}>{todo.priority}</span>
          <Chip variant="solid">{todo.scope}</Chip>
          {todo.room && <Chip variant="room">@{todo.room}</Chip>}
          {todo.tags.map((tag) => (
            <Chip key={tag} variant="tag">
              #{tag}
            </Chip>
          ))}
        </div>
      </div>
      <div className="todo-row-actions">
        <DropdownSelect
          value={todo.status}
          onValueChange={(value) => onToggle(value as TodoStatus)}
          options={TODO_STATUS_OPTIONS}
        />
        <button onClick={onOpenPreview} className="todo-action-btn" aria-label="Preview todo">
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <button onClick={onDelete} className="todo-action-btn-danger" aria-label="Delete">
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

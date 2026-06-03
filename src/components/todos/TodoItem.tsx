import { useState } from "react";
import type { Todo, TodoStatus } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { Maximize2, Trash2 } from "lucide-react";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { Button } from "@/components/common/Button";
import { Inline } from "@/components/common/LayoutPrimitives";
import { InputField } from "@/components/common/input/InputField";
import { Text } from "@/components/common/Typography";

const TODO_STATUS_OPTIONS = [
  { value: "open", label: "open" },
  { value: "in-progress", label: "in progress" },
  { value: "done", label: "done" },
];

function getPriorityVariant(priority: Todo["priority"]) {
  if (priority === "high") return "priority-high";
  if (priority === "low") return "priority-low";
  return "priority-normal";
}

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
          <InputField
            label="Todo title"
            hideLabel
            value={title}
            onChange={setTitle}
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
            autoFocus
            size="sm"
          />
        ) : (
          <Button
            type="button"
            variant="transparent"
            size="content"
            justify="start"
            textAlign="left"
            tone={todo.status === "done" ? "muted" : "default"}
            onDoubleClick={() => setEditing(true)}
          >
            <Text
              as="span"
              size="sm"
              tone={todo.status === "done" ? "muted" : "default"}
              decoration={todo.status === "done" ? "line-through" : "none"}
            >
              {todo.title}
            </Text>
          </Button>
        )}
        <Inline gap="1" align="center">
          <Chip variant={getPriorityVariant(todo.priority)}>{todo.priority}</Chip>
          <Chip variant="solid">{todo.scope}</Chip>
          {todo.room && <Chip variant="room">@{todo.room}</Chip>}
          {todo.tags.map((tag) => (
            <Chip key={tag} variant="tag">
              #{tag}
            </Chip>
          ))}
        </Inline>
      </div>
      <div className="todo-row-actions">
        <DropdownSelect
          value={todo.status}
          onValueChange={(value) => onToggle(value as TodoStatus)}
          options={TODO_STATUS_OPTIONS}
          triggerWidth="fit"
        />
        <Button
          variant="transparent"
          size="icon"
          onClick={onOpenPreview}
          aria-label="Preview todo"
          tone="muted"
        >
          <Maximize2 />
        </Button>
        <Button
          variant="transparent"
          size="icon"
          onClick={onDelete}
          aria-label="Delete"
          tone="destructive"
        >
          <Trash2 />
        </Button>
      </div>
    </li>
  );
}

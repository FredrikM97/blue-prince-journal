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
  const titleTone = todo.status === "done" ? "muted" : "default";
  const titleDecoration = todo.status === "done" ? "line-through" : "none";

  return (
    <li className="todo-row-item">
      <div className="todo-row-main">
        {editing ? (
          <div className="todo-row-title-line">
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
          </div>
        ) : (
          <div className="todo-row-title-line">
            <Button
              type="button"
              variant="transparent"
              size="content"
              justify="start"
              textAlign="left"
              tone={titleTone}
              onDoubleClick={() => setEditing(true)}
              className="todo-row-title-button"
            >
              <Text as="span" size="sm" tone={titleTone} decoration={titleDecoration}>
                {todo.title}
              </Text>
            </Button>
          </div>
        )}

        <div className="todo-row-actions-line">
          <div className="todo-row-actions">
            <DropdownSelect
              value={todo.status}
              onValueChange={(value) => onToggle(value as TodoStatus)}
              options={TODO_STATUS_OPTIONS}
              triggerWidth="fit"
              triggerVariant="flat"
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
        </div>

        <Inline as="div" gap="1" align="center" wrap>
          <Chip variant={getPriorityVariant(todo.priority)}>
            <span className="todo-row-chip-text">{todo.priority}</span>
          </Chip>
          <Chip variant="solid">
            <span className="todo-row-chip-text">{todo.scope}</span>
          </Chip>
          {todo.room && (
            <Chip variant="room">
              <span className="todo-row-chip-text">@{todo.room}</span>
            </Chip>
          )}
          {todo.tags.map((tag) => (
            <Chip key={tag} variant="tag">
              <span className="todo-row-chip-text">#{tag}</span>
            </Chip>
          ))}
        </Inline>
      </div>
    </li>
  );
}

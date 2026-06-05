import type { Todo, TodoStatus } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { CheckCircle2, Circle, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { Text } from "@/components/common/Typography";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/common/dropdown/DropdownMenu";

function getPriorityVariant(priority: Todo["priority"]) {
  if (priority === "high") return "priority-high";
  if (priority === "low") return "priority-low";
  return "priority-normal";
}

export function TodoItem({
  todo,
  onToggle,
  onDelete,
  onOpenPreview,
}: {
  todo: Todo;
  onToggle: (s: TodoStatus) => void;
  onDelete: () => void;
  onOpenPreview: () => void;
}) {
  const titleTone = todo.status === "done" ? "muted" : "default";
  const titleDecoration = todo.status === "done" ? "line-through" : "none";

  return (
    <li>
      <Stack variant="todo-row-item" gap="0">
        <Stack variant="todo-row-main" gap="0">
          <Stack variant="todo-row-title-line" gap="0">
            <Stack variant="todo-row-title-wrap" gap="0">
              <Stack variant="todo-row-title-button-wrap" gap="0">
                <Button
                  type="button"
                  variant="transparent"
                  size="content"
                  fullWidth
                  justify="start"
                  textAlign="left"
                  tone={titleTone}
                  onClick={onOpenPreview}
                >
                  <Text as="span" size="sm" tone={titleTone} decoration={titleDecoration}>
                    {todo.title}
                  </Text>
                </Button>
              </Stack>
            </Stack>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-h2" tone="muted" aria-label="Todo actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" variant="select">
                <DropdownMenuItem onSelect={() => onOpenPreview()}>
                  <Eye className="icon-sm" />
                  <Text as="span" size="sm">
                    Preview
                  </Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Circle className="icon-sm" />
                    <Text as="span" size="sm">
                      Set status
                    </Text>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => onToggle("open" as TodoStatus)}>
                      <Circle className="icon-sm" />
                      <Text as="span" size="sm">
                        Open
                      </Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onToggle("in-progress" as TodoStatus)}>
                      <Circle className="icon-sm" />
                      <Text as="span" size="sm">
                        In progress
                      </Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onToggle("done" as TodoStatus)}>
                      <CheckCircle2 className="icon-sm" />
                      <Text as="span" size="sm">
                        Done
                      </Text>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem tone="active" onSelect={() => onDelete()}>
                  <Trash2 className="icon-sm" />
                  <Text as="span" size="sm">
                    Delete
                  </Text>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Stack>

          <Stack variant="todo-row-tags-line" gap="0">
            <Inline as="div" gap="1" align="center" wrap>
              <Chip variant={getPriorityVariant(todo.priority)}>{todo.priority}</Chip>
              <Chip variant="solid">{todo.scope}</Chip>
              {todo.room && <Chip variant="room">@{todo.room}</Chip>}
              {todo.tags.map((tag) => (
                <Chip key={tag} variant="tag">
                  #{tag}
                </Chip>
              ))}
            </Inline>
          </Stack>
        </Stack>
      </Stack>
    </li>
  );
}

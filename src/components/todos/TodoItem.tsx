import type { Todo, TodoStatus } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { CheckCircle2, Circle, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { getTodoPriorityChipVariant } from "@/components/todos/todoPriority";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
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
} from "@/components/common/menu/DropdownMenu";

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
      <Stack gap="0" className="todo-row-item">
        <Stack gap="0" className="todo-row-main">
          <Stack gap="0" className="todo-row-title-line">
            <Stack gap="0" className="todo-row-title-wrap">
              <Stack gap="0" className="todo-row-title-button-wrap">
                <Button
                  type="button"
                  variant="ghost"
                  size="content"
                  fullWidth
                  justify="start"
                  textAlign="left"
                  className="bg-transparent hover:bg-transparent hover:opacity-75"
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
                <Button variant="outline" size="icon-h2" aria-label="Todo actions">
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

          <Stack gap="0" className="todo-row-tags-line">
            <Inline as="div" gap="1" align="center" wrap>
              <Chip variant={getTodoPriorityChipVariant(todo.priority)}>{todo.priority}</Chip>
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

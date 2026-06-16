import { memo } from "react";
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

export const TodoItem = memo(function TodoItem({
  todo,
  onToggle,
  onDelete,
  onOpenPreview,
}: {
  todo: Todo;
  onToggle: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onOpenPreview: (todo: Todo) => void;
}) {
  const titleTone = todo.status === "done" ? "muted" : "default";
  const titleDecoration = todo.status === "done" ? "line-through" : "none";

  return (
    <li>
      <div
        className="cursor-pointer rounded-lg border border-border bg-card px-3 py-2 hover:bg-muted"
        onClick={() => onOpenPreview(todo)}
      >
        <Stack gap="0" className="min-w-0 space-y-1">
          <Stack gap="0" className="flex min-w-0 items-center justify-between gap-2">
            <Stack gap="0" className="min-w-0 flex-1 overflow-hidden">
              <Stack gap="0">
                <Text
                  as="span"
                  size="sm"
                  tone={titleTone}
                  decoration={titleDecoration}
                  className="line-clamp-2 whitespace-normal break-words py-0.5"
                >
                  {todo.title}
                </Text>
              </Stack>
            </Stack>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-h2" aria-label="Todo actions" onClick={(e) => e.stopPropagation()}>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" variant="select" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onSelect={() => onOpenPreview(todo)}>
                  <Eye className="h-3.5 w-3.5" />
                  <Text as="span" size="sm">
                    Preview
                  </Text>
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Circle className="h-3.5 w-3.5" />
                    <Text as="span" size="sm">
                      Set status
                    </Text>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onSelect={() => onToggle(todo.id, "open" as TodoStatus)}>
                      <Circle className="h-3.5 w-3.5" />
                      <Text as="span" size="sm">
                        Open
                      </Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onToggle(todo.id, "in-progress" as TodoStatus)}>
                      <Circle className="h-3.5 w-3.5" />
                      <Text as="span" size="sm">
                        In progress
                      </Text>
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onToggle(todo.id, "done" as TodoStatus)}>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <Text as="span" size="sm">
                        Done
                      </Text>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem tone="active" onSelect={() => onDelete(todo.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                  <Text as="span" size="sm">
                    Delete
                  </Text>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Stack>

          <Stack gap="0" className="mt-1 pt-1">
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
      </div>
    </li>
  );
});

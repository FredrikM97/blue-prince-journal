import type { Todo } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { todoPriorityClass } from "./Constants";
import { MetaRow, PreviewSection, PreviewTimestamps } from "@/components/common/PreviewContent";
import { PreviewDialog } from "@/components/common/PreviewDialog";

export function TodoPreviewContent({ todo }: { todo: Todo }) {
  return (
    <>
      <MetaRow label="Status">
        <Chip variant="solid">{todo.status}</Chip>
      </MetaRow>
      <MetaRow label="Priority">
        <span className={todoPriorityClass(todo.priority)}>{todo.priority}</span>
      </MetaRow>
      <MetaRow label="Scope">
        <Chip variant="solid">{todo.scope}</Chip>
      </MetaRow>
      {todo.room && (
        <MetaRow label="Room">
          <Chip variant="room">@{todo.room}</Chip>
        </MetaRow>
      )}
      {todo.tags.length > 0 && (
        <MetaRow label="Tags">
          <span className="flex flex-wrap gap-1">
            {todo.tags.map((tag) => (
              <Chip key={tag} variant="tag">
                #{tag}
              </Chip>
            ))}
          </span>
        </MetaRow>
      )}

      {todo.notes && (
        <PreviewSection>
          <MarkdownPreview>{todo.notes}</MarkdownPreview>
        </PreviewSection>
      )}

      <PreviewTimestamps
        createdAt={todo.createdAt}
        updatedAt={todo.updatedAt}
        completedAt={todo.completedAt}
      />
    </>
  );
}

export function TodoPreviewDialog({
  todo,
  open,
  onOpenChange,
}: {
  todo: Todo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!todo) return null;

  const subtitle = `${todo.status} · Created ${new Date(todo.createdAt).toLocaleDateString()}`;

  return (
    <PreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={todo.title}
      subtitle={subtitle}
      strikeTitle={todo.status === "done"}
    >
      <TodoPreviewContent todo={todo} />
    </PreviewDialog>
  );
}

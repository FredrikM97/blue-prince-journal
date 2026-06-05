import type { Todo } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { MetaRow, PreviewSection, PreviewTimestamps } from "@/components/common/PreviewContent";
import { PreviewDialog } from "@/components/common/PreviewDialog";
import { Inline } from "@/components/common/LayoutPrimitives";
import { AttachedImagesGallery } from "@/components/common/AttachedImagesGallery";

function getPriorityVariant(priority: Todo["priority"]) {
  if (priority === "high") return "priority-high";
  if (priority === "low") return "priority-low";
  return "priority-normal";
}

export function TodoPreviewContent({ todo }: { todo: Todo }) {
  const body = todo.body;
  return (
    <>
      <MetaRow label="Status">
        <Chip variant="solid">{todo.status}</Chip>
      </MetaRow>
      <MetaRow label="Priority">
        <Chip variant={getPriorityVariant(todo.priority)}>{todo.priority}</Chip>
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
          <Inline as="div" gap="1" wrap align="start">
            {todo.tags.map((tag) => (
              <Chip key={tag} variant="tag">
                #{tag}
              </Chip>
            ))}
          </Inline>
        </MetaRow>
      )}

      {body && (
        <PreviewSection>
          <MarkdownPreview>{body}</MarkdownPreview>
        </PreviewSection>
      )}

      {todo.imageIds && todo.imageIds.length > 0 && (
        <PreviewSection>
          <AttachedImagesGallery imageIds={todo.imageIds} title="Attached images" collapsible />
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

  const subtitle = `Created ${new Date(todo.createdAt).toLocaleDateString()}`;

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

import type { Todo } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { MetaRow, PreviewSection, PreviewTimestamps } from "@/components/common/preview/PreviewContent";
import { Inline } from "@/components/common/LayoutPrimitives";
import { AttachedImagesGallery } from "@/components/common/AttachedImagesGallery";
import { getTodoPriorityChipVariant } from "@/components/todos/todoPriority";
import { saveTodo } from "@/data/mutations/todoMutations";
import { EditablePreviewDialog } from "@/components/common/preview/EditablePreviewDialog";

export function TodoPreviewContent({ todo }: { todo: Todo }) {
  const body = todo.body;
  return (
    <>
      <MetaRow label="Status">
        <Chip variant="solid">{todo.status}</Chip>
      </MetaRow>
      <MetaRow label="Priority">
        <Chip variant={getTodoPriorityChipVariant(todo.priority)}>{todo.priority}</Chip>
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
  const activeTodo = todo;
  return (
    <EditablePreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      entityKey={activeTodo.id}
      title={activeTodo.title}
      subtitle={`Created ${new Date(activeTodo.createdAt).toLocaleDateString()}`}
      strikeTitle={activeTodo.status === "done"}
      editAriaLabel="Edit todo"
      initialDraft={activeTodo.body ?? ""}
      saveSuccessMessage="Todo saved"
      onSaveDraft={async (nextDraft) => {
        const next: Todo = {
          ...activeTodo,
          body: nextDraft || undefined,
        };
        await saveTodo(next);
      }}
    >
      <TodoPreviewContent todo={activeTodo} />
    </EditablePreviewDialog>
  );
}

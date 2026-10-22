import { useState } from "react";
import { AttachedImagesGallery } from "@/components/common/AttachedImagesGallery";
import { Chip } from "@/components/common/Chip";
import { Inline } from "@/components/common/LayoutPrimitives";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { EditablePreviewDialog } from "@/components/common/preview/EditablePreviewDialog";
import {
  MetaRow,
  PreviewSection,
  PreviewTimestamps,
} from "@/components/common/preview/PreviewContent";
import { getTodoPriorityChipVariant } from "@/components/todos/todoPriority";
import { saveTodo } from "@/data/mutations/todoMutations";
import type { Todo } from "@/lib/types";

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
  return (
    <TodoPreviewDialogContent key={todo.id} todo={todo} open={open} onOpenChange={onOpenChange} />
  );
}

function TodoPreviewDialogContent({
  todo,
  open,
  onOpenChange,
}: {
  todo: Todo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [optimisticBody, setOptimisticBody] = useState<string | undefined>(todo.body);
  const displayTodo = optimisticBody !== todo.body ? { ...todo, body: optimisticBody } : todo;
  return (
    <EditablePreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      entityKey={todo.id}
      title={todo.title}
      subtitle={`Created ${new Date(todo.createdAt).toLocaleDateString()}`}
      strikeTitle={todo.status === "done"}
      editAriaLabel="Edit todo"
      initialDraft={todo.body ?? ""}
      saveSuccessMessage="Todo saved"
      onSaveDraft={async (nextDraft) => {
        const next: Todo = {
          ...todo,
          body: nextDraft || undefined,
        };
        setOptimisticBody(next.body);
        await saveTodo(next);
      }}
    >
      <TodoPreviewContent todo={displayTodo} />
    </EditablePreviewDialog>
  );
}

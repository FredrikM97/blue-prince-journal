import { useState, type ReactNode } from "react";
import type { Todo } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { MarkdownEditor } from "@/components/common/markdown/MarkdownEditor";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { MetaRow, PreviewSection, PreviewTimestamps } from "@/components/common/PreviewContent";
import { PreviewDialog } from "@/components/common/PreviewDialog";
import { Inline } from "@/components/common/LayoutPrimitives";
import { AttachedImagesGallery } from "@/components/common/AttachedImagesGallery";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/Stack";
import { PreviewEditModeActions } from "@/components/common/PreviewEditModeActions";
import { getTodoPriorityChipVariant } from "@/components/todos/todoPriority";
import { saveTodo } from "@/data/mutations";
import { PenLine } from "lucide-react";
import { toast } from "sonner";

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
  const [isEditing, setIsEditing] = useState(false);
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);
  const [detailsDraft, setDetailsDraft] = useState("");

  if (!todo) return null;
  const activeTodo = todo;

  function startEditDetails() {
    setEditingTodoId(activeTodo.id);
    setDetailsDraft(activeTodo.body ?? "");
    setIsEditing(true);
  }

  function closeEditDetails() {
    setIsEditing(false);
    setEditingTodoId(null);
  }

  const isEditingCurrentTodo = isEditing && editingTodoId === activeTodo.id;

  async function saveDraft() {
    const next: Todo = {
      ...activeTodo,
      body: detailsDraft || undefined,
    };
    await saveTodo(next);
    closeEditDetails();
    toast.success("Todo saved");
  }

  let subtitle: string | undefined = `Created ${new Date(activeTodo.createdAt).toLocaleDateString()}`;
  let title = activeTodo.title;
  let strikeTitle = activeTodo.status === "done";
  let showHeaderClose = true;
  let dialogVariant: "preview" | "wide" = "preview";
  let bodyVariant: "dialog-scroll-body" | "dialog-scroll-body-tall" = "dialog-scroll-body";
  let headerActions: ReactNode = (
    <Button
      variant="ghost"
      size="icon"
      onClick={startEditDetails}
      aria-label="Edit todo"
      title="Edit todo"
    >
      <PenLine className="h-4 w-4" />
    </Button>
  );
  let content: ReactNode = <TodoPreviewContent todo={activeTodo} />;

  if (isEditingCurrentTodo) {
    title = "Edit details";
    subtitle = undefined;
    strikeTitle = false;
    showHeaderClose = false;
    dialogVariant = "wide";
    bodyVariant = "dialog-scroll-body-tall";
    headerActions = (
      <PreviewEditModeActions
        onCancel={closeEditDetails}
        onSave={() => {
          void saveDraft();
        }}
      />
    );
    content = (
      <Stack gap="0" variant="dialog-scroll-body">
        <MarkdownEditor
          value={detailsDraft}
          onChange={setDetailsDraft}
          placeholder="Details (markdown supported)…"
          rows={24}
          allowExpand={false}
        />
      </Stack>
    );
  }

  return (
    <PreviewDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeEditDetails();
        }
        onOpenChange(nextOpen);
      }}
      title={title}
      subtitle={subtitle}
      strikeTitle={strikeTitle}
      headerActions={headerActions}
      showHeaderClose={showHeaderClose}
      dialogVariant={dialogVariant}
      bodyVariant={bodyVariant}
    >
      {content}
    </PreviewDialog>
  );
}

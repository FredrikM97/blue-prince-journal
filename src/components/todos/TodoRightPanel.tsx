import type { Todo } from "@/lib/types";
import { TodoPreviewContent, TodoPreviewDialog } from "./TodoPreviewDialog";
import { PreviewSidePanel } from "@/components/common/PreviewSidePanel";

export function TodoRightPanel({
  todo,
  onClose,
  onEdit,
}: {
  todo: Todo;
  onClose: () => void;
  onEdit?: () => void;
}) {
  return (
    <PreviewSidePanel
      title={todo.title}
      subtitle={`Created ${new Date(todo.createdAt).toLocaleDateString()}`}
      done={todo.status === "done"}
      panelKey={`todo:${todo.id}`}
      onClose={onClose}
      onEdit={onEdit}
      editAriaLabel="Edit todo"
      renderExpandDialog={(open, onOpenChange) => (
        <TodoPreviewDialog todo={todo} open={open} onOpenChange={onOpenChange} />
      )}
    >
      <TodoPreviewContent todo={todo} />
    </PreviewSidePanel>
  );
}

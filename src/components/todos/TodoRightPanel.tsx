import { useState } from "react";
import { PenLine } from "lucide-react";
import type { Todo } from "@/lib/types";
import { Button } from "@/components/common/Button";
import { SidePanelRight } from "@/components/common/SidePanel";
import { Stack } from "@/components/common/general/Stack";
import { TodoPreviewContent, TodoPreviewDialog } from "./TodoPreviewDialog";

export function TodoRightPanel({
  todo,
  onClose,
  onEdit,
}: {
  todo: Todo;
  onClose: () => void;
  onEdit?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  let headerActions: React.ReactNode = undefined;
  if (onEdit) {
    headerActions = (
      <Button variant="ghost" size="icon" onClick={onEdit} title="Edit todo" aria-label="Edit todo">
        <PenLine className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <SidePanelRight
      title={todo.title}
      subtitle={`Created ${new Date(todo.createdAt).toLocaleDateString()}`}
      done={todo.status === "done"}
      panelKey={`todo:${todo.id}`}
      onClose={onClose}
      onExpand={() => setExpanded(true)}
      headerActions={headerActions}
      expandDialog={<TodoPreviewDialog todo={todo} open={expanded} onOpenChange={setExpanded} />}
    >
      <Stack gap="2" variant="dialog-scroll-body">
        <TodoPreviewContent todo={todo} />
      </Stack>
    </SidePanelRight>
  );
}

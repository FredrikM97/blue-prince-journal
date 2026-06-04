import { useState } from "react";
import { SidePanel } from "@/components/common/SidePanel";
import type { Todo } from "@/lib/types";
import { TodoPreviewContent, TodoPreviewDialog } from "./TodoPreviewDialog";

export function TodoRightPanel({ todo, onClose }: { todo: Todo; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <SidePanel.Right
      title={todo.title}
      subtitle={`${todo.status} · Created ${new Date(todo.createdAt).toLocaleDateString()}`}
      done={todo.status === "done"}
      onExpand={() => setExpanded(true)}
      onClose={onClose}
      panelKey={`todo:${todo.id}`}
      expandDialog={<TodoPreviewDialog todo={todo} open={expanded} onOpenChange={setExpanded} />}
    >
      <TodoPreviewContent todo={todo} />
    </SidePanel.Right>
  );
}

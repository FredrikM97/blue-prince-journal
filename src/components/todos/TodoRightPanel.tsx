import { useState } from "react";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { SidePanel } from "@/components/common/SidePanel";
import { MetaText } from "@/components/common/Typography";
import type { Todo } from "@/lib/types";
import { TodoPreviewDialog } from "./TodoPreviewDialog";

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
      {todo.notes ? (
        <MarkdownPreview>{todo.notes}</MarkdownPreview>
      ) : (
        <MetaText>No notes added.</MetaText>
      )}
    </SidePanel.Right>
  );
}

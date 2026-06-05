import { useState, type ReactNode } from "react";
import { PenLine } from "lucide-react";
import { Button } from "@/components/common/Button";
import { SidePanel } from "@/components/common/SidePanel";

export function PreviewSidePanel({
  title,
  subtitle,
  done = false,
  panelKey,
  onClose,
  onEdit,
  editAriaLabel,
  renderExpandDialog,
  children,
}: {
  title: string;
  subtitle?: string;
  done?: boolean;
  panelKey: string;
  onClose: () => void;
  onEdit?: () => void;
  editAriaLabel: string;
  renderExpandDialog: (open: boolean, onOpenChange: (open: boolean) => void) => ReactNode;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  let headerActions: ReactNode = undefined;
  if (onEdit) {
    headerActions = (
      <Button
        variant="ghost"
        size="icon"
        onClick={onEdit}
        title={editAriaLabel}
        aria-label={editAriaLabel}
      >
        <PenLine className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <SidePanel.Right
      title={title}
      subtitle={subtitle}
      done={done}
      onExpand={() => setExpanded(true)}
      onClose={onClose}
      panelKey={panelKey}
      headerActions={headerActions}
      expandDialog={renderExpandDialog(expanded, setExpanded)}
    >
      {children}
    </SidePanel.Right>
  );
}

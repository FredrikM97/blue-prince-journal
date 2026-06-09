import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";

export function TitleActionHeader({
  title,
  subtitle,
  actions,
  showClose = true,
  onClose,
  closeSlot,
  rowClassName = "panel-header",
  titleWrapClassName = "panel-header-title-wrap",
  actionsClassName = "preview-header-actions",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  showClose?: boolean;
  onClose?: () => void;
  closeSlot?: ReactNode;
  rowClassName?: string;
  titleWrapClassName?: string;
  actionsClassName?: string;
}) {
  const shouldRenderActions = Boolean(actions) || (showClose && (Boolean(onClose) || Boolean(closeSlot)));

  return (
    <div className={rowClassName}>
      <div className={titleWrapClassName}>
        {title}
        {subtitle}
      </div>
      {shouldRenderActions && (
        <div className={actionsClassName}>
          {actions}
          {showClose && closeSlot}
          {showClose && !closeSlot && onClose && (
            <Button variant="ghost" size="icon" onClick={onClose} title="Close" aria-label="Close panel">
              <X className="icon-md" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

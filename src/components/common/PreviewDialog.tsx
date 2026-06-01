import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";

export function PreviewDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  strikeTitle = false,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  strikeTitle?: boolean;
  children: ReactNode;
}) {
  let titleClassName = "font-serif text-xl";
  if (strikeTitle) {
    titleClassName = "font-serif text-xl text-muted-foreground line-through";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="preview">
        <DialogHeader>
          <DialogTitle className={titleClassName}>{title}</DialogTitle>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground capitalize">{subtitle}</p>
          )}
        </DialogHeader>
        <div className="dialog-scroll-body space-y-2">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

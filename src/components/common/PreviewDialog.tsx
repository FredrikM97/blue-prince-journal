import type { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { MetaText } from "@/components/common/Typography";
import { Stack } from "@/components/common/Stack";

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
  let titleClassName = "text-xl";
  if (strikeTitle) {
    titleClassName = "text-xl text-muted-foreground line-through";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="preview">
        <DialogHeader>
          <DialogTitle className={titleClassName}>{title}</DialogTitle>
          {subtitle && (
            <MetaText marginTop="0.5" capitalize>
              {subtitle}
            </MetaText>
          )}
        </DialogHeader>
        <Stack gap="2" variant="dialog-scroll-body">
          {children}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

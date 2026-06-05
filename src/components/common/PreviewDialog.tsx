import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { Inline } from "@/components/common/LayoutPrimitives";
import { MetaText } from "@/components/common/Typography";
import { Stack } from "@/components/common/Stack";

function PreviewDialogHeaderRow({
  title,
  titleClassName,
  headerActions,
  showClose,
}: {
  title: string;
  titleClassName: string;
  headerActions?: ReactNode;
  showClose: boolean;
}) {
  return (
    <Inline
      as="div"
      gap="2"
      justify="between"
      align="start"
      className="preview-dialog-title-row"
    >
      <DialogTitle className={titleClassName}>{title}</DialogTitle>
      <Inline as="div" gap="1" align="center" className="preview-dialog-title-actions">
        {headerActions}
        {showClose && (
          <DialogClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close" title="Close">
              <X className="icon-md" />
            </Button>
          </DialogClose>
        )}
      </Inline>
    </Inline>
  );
}

export function PreviewDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  strikeTitle = false,
  headerActions,
  showHeaderClose = true,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  strikeTitle?: boolean;
  headerActions?: ReactNode;
  showHeaderClose?: boolean;
  children: ReactNode;
}) {
  let titleClassName = "text-xl";
  if (strikeTitle) {
    titleClassName = "text-xl text-muted-foreground line-through";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="preview" showClose={false}>
        <DialogHeader>
          <PreviewDialogHeaderRow
            title={title}
            titleClassName={titleClassName}
            headerActions={headerActions}
            showClose={showHeaderClose}
          />
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

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import type { DialogVariant } from "@/components/common/Dialog";
import { MetaText } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";
import { TitleActionHeader } from "@/components/common/TitleActionHeader";
import "./preview-dialog.css";

export function PreviewDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  strikeTitle = false,
  headerActions,
  showHeaderClose = true,
  dialogVariant = "preview",
  bodyVariant = "dialog-scroll-body",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  strikeTitle?: boolean;
  headerActions?: ReactNode;
  showHeaderClose?: boolean;
  dialogVariant?: DialogVariant;
  bodyVariant?: "dialog-scroll-body" | "dialog-scroll-body-tall";
  children: ReactNode;
}) {
  let titleClassName = "text-xl";
  if (strikeTitle) {
    titleClassName = "text-xl text-muted-foreground line-through";
  }
  const bodyClassName =
    bodyVariant === "dialog-scroll-body-tall" ? "dialog-scroll-body-tall" : "dialog-scroll-body";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant={dialogVariant} showClose={false}>
        <DialogHeader>
          <TitleActionHeader
            title={<DialogTitle className={titleClassName}>{title}</DialogTitle>}
            subtitle={
              subtitle ? (
                <MetaText marginTop="0.5" capitalize>
                  {subtitle}
                </MetaText>
              ) : undefined
            }
            actions={headerActions}
            showClose={showHeaderClose}
            closeSlot={
              <DialogClose asChild>
                <Button variant="ghost" size="icon" aria-label="Close" title="Close">
                  <X className="icon-md" />
                </Button>
              </DialogClose>
            }
            rowClassName="preview-dialog-title-row"
            actionsClassName="preview-dialog-title-actions"
          />
        </DialogHeader>
        <Stack gap="2" className={bodyClassName}>
          {children}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

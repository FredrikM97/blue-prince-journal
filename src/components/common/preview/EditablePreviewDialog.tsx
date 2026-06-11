import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PenLine, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { PreviewDialog } from "@/components/common/preview/PreviewDialog";
import { Inline } from "@/components/common/LayoutPrimitives";
import { MarkdownEditor } from "@/components/common/markdown/MarkdownEditor";
import { Stack } from "@/components/common/general/Stack";

export function EditablePreviewDialog({
  open,
  onOpenChange,
  entityKey,
  title,
  subtitle,
  strikeTitle = false,
  editAriaLabel,
  initialDraft,
  saveSuccessMessage,
  onSaveDraft,
  viewDialogVariant = "preview",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityKey: string;
  title: string;
  subtitle?: string;
  strikeTitle?: boolean;
  editAriaLabel: string;
  initialDraft: string;
  saveSuccessMessage: string;
  onSaveDraft: (nextDraft: string) => Promise<void>;
  viewDialogVariant?: "preview" | "expand";
  children: ReactNode;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntityKey, setEditingEntityKey] = useState<string | null>(null);
  const [detailsDraft, setDetailsDraft] = useState("");

  function startEditDetails() {
    setEditingEntityKey(entityKey);
    setDetailsDraft(initialDraft);
    setIsEditing(true);
  }

  function closeEditDetails() {
    setIsEditing(false);
    setEditingEntityKey(null);
  }

  const isEditingCurrentEntity = isEditing && editingEntityKey === entityKey;

  const saveDetails = useCallback(() => {
    void (async () => {
      await onSaveDraft(detailsDraft);
      closeEditDetails();
      toast.success(saveSuccessMessage);
    })();
  }, [detailsDraft, onSaveDraft, saveSuccessMessage]);

  useEffect(() => {
    if (!open || !isEditingCurrentEntity) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveDetails();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditingCurrentEntity, open, saveDetails]);

  return (
    <PreviewDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          closeEditDetails();
        }
        onOpenChange(nextOpen);
      }}
      title={title}
      subtitle={subtitle}
      strikeTitle={strikeTitle}
      headerActions={
        isEditingCurrentEntity ? (
          <Inline gap="2" align="center" justify="end">
            <Button variant="ghost" size="default" onClick={closeEditDetails}>
              Cancel
            </Button>
            <Button
              variant="brass"
              size="default"
              onClick={saveDetails}
            >
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </Inline>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={startEditDetails}
            aria-label={editAriaLabel}
            title={editAriaLabel}
          >
            <PenLine className="h-4 w-4" />
          </Button>
        )
      }
      showHeaderClose={false}
      dialogVariant={isEditingCurrentEntity ? "expand" : viewDialogVariant}
      bodyVariant={isEditingCurrentEntity ? "dialog-scroll-body-tall" : "dialog-scroll-body"}
    >
      {isEditingCurrentEntity ? (
        <Stack gap="0" variant="dialog-scroll-body">
          <MarkdownEditor
            value={detailsDraft}
            onChange={setDetailsDraft}
            placeholder="Details (markdown supported)…"
            rows={24}
            allowExpand={false}
          />
        </Stack>
      ) : (
        children
      )}
    </PreviewDialog>
  );
}

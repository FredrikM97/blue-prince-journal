import { Save } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Inline } from "@/components/common/LayoutPrimitives";

export function PreviewEditModeActions({
  onCancel,
  onSave,
  saveLabel = "Save",
}: {
  onCancel: () => void;
  onSave: () => void;
  saveLabel?: string;
}) {
  return (
    <Inline gap="2" align="center" justify="end">
      <Button variant="ghost" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button variant="brass" size="sm" onClick={onSave}>
        <Save className="h-3.5 w-3.5" />
        {saveLabel}
      </Button>
    </Inline>
  );
}
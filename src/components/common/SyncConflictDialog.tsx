import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import { Button } from "@/components/common/Button";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { Text } from "@/components/common/Typography";
import type { SyncConflictChoice } from "@/data/sync";

export type { SyncConflictChoice };

/**
 * Dialog shown when connecting a sync folder that already has data while local
 * data also exists. The caller passes a `resolve` callback (from a Promise)
 * and renders this dialog; the user's button click resolves the Promise so the
 * async connect flow can continue.
 */
export function SyncConflictDialog({
  open,
  onChoice,
}: {
  open: boolean;
  onChoice: (choice: SyncConflictChoice) => void;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onChoice("cancel");
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Folder already has data</DialogTitle>
          <DialogDescription>
            Both this device and the selected folder have existing data. What should happen?
          </DialogDescription>
        </DialogHeader>
        <Stack gap="4">
          <Stack gap="2">
            <Text size="sm">
              <strong>Use folder data</strong> — import everything from the folder and replace local
              data.
            </Text>
            <Text size="sm">
              <strong>Keep my data</strong> — keep local data and overwrite the folder with it.
            </Text>
          </Stack>
          <Inline gap="2" justify="end">
            <Button variant="outline" onClick={() => onChoice("cancel")}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => onChoice("keep")}>
              Keep my data
            </Button>
            <Button onClick={() => onChoice("overwrite")}>Use folder data</Button>
          </Inline>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

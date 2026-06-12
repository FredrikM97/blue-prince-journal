import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { InputField } from "@/components/common/input/InputField";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { MetaText, Text } from "@/components/common/Typography";
import type { FeedbackType } from "@/data/feedback";

const FEEDBACK_TYPE_OPTIONS = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "general", label: "General" },
  { value: "question", label: "Question" },
];

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  onMessageChange: (value: string) => void;
  contact: string;
  onContactChange: (value: string) => void;
  type: FeedbackType;
  onTypeChange: (value: FeedbackType) => void;
  submitting: boolean;
  buildHash: string;
  onSubmit: () => void;
};

export function FeedbackDialog({
  open,
  onOpenChange,
  message,
  onMessageChange,
  contact,
  onContactChange,
  type,
  onTypeChange,
  submitting,
  buildHash,
  onSubmit,
}: FeedbackDialogProps) {
  let submitLabel = "Send";
  if (submitting) {
    submitLabel = "Sending...";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>
            Share a bug report, feature idea, or anything that would make the journal better.
          </DialogDescription>
          <MetaText as="p" size="xs">
            Build:{" "}
            <Text
              as="code"
              className="rounded bg-muted px-1 py-0.5 text-[0.8em]"
              size="xs"
              tone="default"
            >
              {buildHash}
            </Text>{" "}
          </MetaText>
        </DialogHeader>

        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            onSubmit();
          }}
        >
          <Stack gap="3">
            <Stack gap="1">
              <Text as="span" size="xs" tone="default">
                Type
              </Text>
              <DropdownSelect
                value={type}
                onValueChange={(value) => onTypeChange(value as FeedbackType)}
                options={FEEDBACK_TYPE_OPTIONS}
                triggerWidth="fit"
              />
            </Stack>

            <InputField
              label="Message"
              autoFocus
              markdown
              rows={6}
              value={message}
              onChange={onMessageChange}
              placeholder="Tell me what happened or what you'd like to see..."
            />

            <InputField
              label="Contact"
              value={contact}
              onChange={onContactChange}
              placeholder="Email or handle, optional"
            />

            <Inline gap="2" justify="end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting || message.trim().length === 0}>
                <Send className="mr-1 h-4 w-4" />
                {submitLabel}
              </Button>
            </Inline>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

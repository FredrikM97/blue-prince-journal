import type { FormEvent } from "react";
import { useState } from "react";
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
import { submitFeedback } from "@/data/feedback";
import type { FeedbackType } from "@/data/feedback";
import { toast } from "sonner";

const FEEDBACK_TYPE_OPTIONS = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "general", label: "General" },
  { value: "question", label: "Question" },
];

type FeedbackDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState<FeedbackType>("general");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    setSubmitting(true);
    try {
      await submitFeedback({
        message: trimmedMessage,
        contact: contact.trim(),
        appVersion: __APP_COMMIT_HASH__,
        type,
      });
      toast.success("Feedback sent");
      setMessage("");
      setContact("");
      setType("general");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send feedback");
    } finally {
      setSubmitting(false);
    }
  }

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
              {__APP_COMMIT_HASH__}
            </Text>{" "}
          </MetaText>
        </DialogHeader>

        <form
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            void onSubmit();
          }}
        >
          <Stack gap="3">
            <Stack gap="1">
              <Text as="span" size="xs" tone="default">
                Type
              </Text>
              <DropdownSelect
                value={type}
                onValueChange={(value) => setType(value as FeedbackType)}
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
              onChange={setMessage}
              placeholder="Tell me what happened or what you'd like to see..."
            />

            <InputField
              label="Contact"
              value={contact}
              onChange={setContact}
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

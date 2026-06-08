import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { submitFeedback } from "@/data/feedback";
import { toast } from "sonner";

import { Button } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/common/Dialog";
import { InputField } from "@/components/common/input/InputField";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { Text, MetaText } from "@/components/common/Typography";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./common/dropdown/DropdownMenu";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function FeedbackDialog({ open, onOpenChange }: Props) {
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [type, setType] = useState<"bug" | "feature" | "general">("general");
  const [submitting, setSubmitting] = useState(false);

  async function send() {
    const trimmed = message.trim();
    if (!trimmed) return;

    setSubmitting(true);

    try {
      await submitFeedback({
        message: trimmed,
        contact: contact.trim() || undefined,
        appVersion: __APP_COMMIT_HASH__,
        type,
      });

      toast.success("Feedback sent");

      setMessage("");
      setContact("");
      setType("general");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to send feedback");
    } finally {
      setSubmitting(false);
    }
  }

  const label = submitting ? "Sending…" : "Send";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send feedback</DialogTitle>
          <DialogDescription>Bug report, feature request, or general feedback.</DialogDescription>

          <MetaText as="p" size="xs">
            Build:{" "}
            <Text as="code" size="xs">
              {__APP_COMMIT_HASH__}
            </Text>
          </MetaText>
        </DialogHeader>

        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            void send();
          }}
        >
          <Stack gap="3">
            <Stack gap="1">
              <Text as="span" size="xs" tone="default">
                Type
              </Text>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="select">
                    {type === "bug" ? "Bug" : type === "feature" ? "Feature" : "General"}
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start">
                  <DropdownMenuItem onSelect={() => setType("bug")}>Bug</DropdownMenuItem>

                  <DropdownMenuItem onSelect={() => setType("feature")}>Feature</DropdownMenuItem>

                  <DropdownMenuItem onSelect={() => setType("general")}>General</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Stack>

            <InputField
              label="Message"
              autoFocus
              markdown
              rows={6}
              value={message}
              onChange={setMessage}
              placeholder="Describe the issue or idea..."
            />

            <InputField
              label="Contact"
              value={contact}
              onChange={setContact}
              placeholder="Optional email or handle"
            />

            <Inline justify="end" gap="2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>

              <Button type="submit" disabled={submitting || message.trim().length === 0}>
                <Send className="app-menu-icon" />
                {label}
              </Button>
            </Inline>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}

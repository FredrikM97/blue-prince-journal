import { useState } from "react";
import type { Note } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { AttachedImagesGallery } from "@/components/common/AttachedImagesGallery";
import { MetaRow, PreviewSection, PreviewTimestamps } from "@/components/common/PreviewContent";
import { PreviewDialog } from "@/components/common/PreviewDialog";
import { MarkdownEditor } from "@/components/common/markdown/MarkdownEditor";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/Stack";
import { saveNote } from "@/data/mutations";
import { PenLine } from "lucide-react";
import { PreviewEditModeActions } from "@/components/common/PreviewEditModeActions";
import { toast } from "sonner";

export function NotePreviewContent({ note }: { note: Note }) {
  return (
    <>
      <MetaRow label="Status">
        <Chip variant="solid">{note.status}</Chip>
      </MetaRow>
      <MetaRow label="Scope">
        <Chip variant="solid">{note.scope}</Chip>
      </MetaRow>
      {note.room && (
        <MetaRow label="Room">
          <Chip variant="room">@{note.room}</Chip>
        </MetaRow>
      )}
      {note.tags.length > 0 && (
        <MetaRow label="Tags">
          <Inline as="div" gap="1" wrap align="start">
            {note.tags.map((tag) => (
              <Chip key={tag} variant="tag">
                #{tag}
              </Chip>
            ))}
          </Inline>
        </MetaRow>
      )}
      {note.body && (
        <PreviewSection>
          <MarkdownPreview>{note.body}</MarkdownPreview>
        </PreviewSection>
      )}

      {note.imageIds.length > 0 && (
        <PreviewSection>
          <AttachedImagesGallery imageIds={note.imageIds} collapsible />
        </PreviewSection>
      )}

      <PreviewTimestamps createdAt={note.createdAt} updatedAt={note.updatedAt} />
    </>
  );
}

export function NotePreviewDialog({
  note,
  open,
  onOpenChange,
}: {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [detailsDraft, setDetailsDraft] = useState("");
  const [savedBodyById, setSavedBodyById] = useState<Record<string, string>>({});

  if (!note) return null;
  const optimisticBody = savedBodyById[note.id];
  const activeNote: Note = optimisticBody === undefined ? note : { ...note, body: optimisticBody };

  function startEditDetails() {
    setEditingNoteId(activeNote.id);
    setDetailsDraft(activeNote.body);
    setIsEditing(true);
  }

  function closeEditDetails() {
    setIsEditing(false);
    setEditingNoteId(null);
  }

  const isEditingCurrentNote = isEditing && editingNoteId === activeNote.id;

  const subtitleParts: string[] = [activeNote.type];
  if (activeNote.date) subtitleParts.push(activeNote.date);
  subtitleParts.push(`Created ${new Date(activeNote.createdAt).toLocaleDateString()}`);

  async function saveDraft() {
    const next: Note = {
      ...activeNote,
      body: detailsDraft,
    };
    await saveNote(next);
    setSavedBodyById((prev) => ({ ...prev, [activeNote.id]: next.body }));
    closeEditDetails();
    toast.success("Note saved");
  }

  let subtitle: string | undefined = subtitleParts.join(" · ");
  let title = activeNote.title;
  let strikeTitle = activeNote.status === "solved";
  let showHeaderClose = true;
  let dialogVariant: "preview" | "wide" = "preview";
  let bodyVariant: "dialog-scroll-body" | "dialog-scroll-body-tall" = "dialog-scroll-body";
  let headerActions: React.ReactNode = (
    <Button
      variant="ghost"
      size="icon"
      onClick={startEditDetails}
      aria-label="Edit note"
      title="Edit note"
    >
      <PenLine className="h-4 w-4" />
    </Button>
  );
  let content: React.ReactNode = <NotePreviewContent note={activeNote} />;

  if (isEditingCurrentNote) {
    title = "Edit details";
    subtitle = undefined;
    strikeTitle = false;
    showHeaderClose = false;
    dialogVariant = "wide";
    bodyVariant = "dialog-scroll-body-tall";
    headerActions = (
      <PreviewEditModeActions
        onCancel={closeEditDetails}
        onSave={() => {
          void saveDraft();
        }}
      />
    );
    content = (
      <Stack gap="0" variant="dialog-scroll-body">
        <MarkdownEditor
          value={detailsDraft}
          onChange={setDetailsDraft}
          placeholder="Details (markdown supported)…"
          rows={24}
          allowExpand={false}
        />
      </Stack>
    );
  }

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
      headerActions={headerActions}
      showHeaderClose={showHeaderClose}
      dialogVariant={dialogVariant}
      bodyVariant={bodyVariant}
    >
      {content}
    </PreviewDialog>
  );
}

import { useState } from "react";
import type { Note } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { AttachedImagesGallery } from "@/components/common/AttachedImagesGallery";
import { MetaRow, PreviewSection, PreviewTimestamps } from "@/components/common/preview/PreviewContent";
import { Inline } from "@/components/common/LayoutPrimitives";
import { saveNote } from "@/data/mutations/noteMutations";
import { EditablePreviewDialog } from "@/components/common/preview/EditablePreviewDialog";

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
  const [savedBodyById, setSavedBodyById] = useState<Record<string, string>>({});

  if (!note) return null;
  const optimisticBody = savedBodyById[note.id];
  const activeNote: Note = optimisticBody === undefined ? note : { ...note, body: optimisticBody };

  const subtitleParts: string[] = [activeNote.type];
  if (activeNote.date) subtitleParts.push(activeNote.date);
  subtitleParts.push(`Created ${new Date(activeNote.createdAt).toLocaleDateString()}`);

  return (
    <EditablePreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      entityKey={activeNote.id}
      title={activeNote.title}
      subtitle={subtitleParts.join(" · ")}
      strikeTitle={activeNote.status === "solved"}
      editAriaLabel="Edit note"
      initialDraft={activeNote.body}
      saveSuccessMessage="Note saved"
      viewDialogVariant="expand"
      onSaveDraft={async (nextDraft) => {
        const next: Note = {
          ...activeNote,
          body: nextDraft,
        };
        await saveNote(next);
        setSavedBodyById((prev) => ({ ...prev, [activeNote.id]: next.body }));
      }}
    >
      <NotePreviewContent note={activeNote} />
    </EditablePreviewDialog>
  );
}

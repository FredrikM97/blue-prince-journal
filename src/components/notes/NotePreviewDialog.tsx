import type { Note } from "@/lib/types";
import { Chip } from "@/components/common/Chip";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import { AttachedImagesGallery } from "@/components/common/AttachedImagesGallery";
import { MetaRow, PreviewSection, PreviewTimestamps } from "@/components/common/PreviewContent";
import { PreviewDialog } from "@/components/common/PreviewDialog";
import { Inline } from "@/components/common/LayoutPrimitives";

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
  if (!note) return null;

  const subtitleParts: string[] = [note.type];
  if (note.date) subtitleParts.push(note.date);
  subtitleParts.push(`Created ${new Date(note.createdAt).toLocaleDateString()}`);

  return (
    <PreviewDialog
      open={open}
      onOpenChange={onOpenChange}
      title={note.title}
      subtitle={subtitleParts.join(" · ")}
      strikeTitle={note.status === "solved"}
    >
      <NotePreviewContent note={note} />
    </PreviewDialog>
  );
}

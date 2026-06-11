import { useCallback, useMemo, useRef, useState } from "react";
import type { Note, StoredImage } from "@/lib/types";
import { Button } from "@/components/common/Button";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { db } from "@/data/db";
import { addImage } from "@/data/mutations/imageMutations";
import { useLiveQuery } from "dexie-react-hooks";
import { ImagePlus } from "lucide-react";
import { NOTE_TYPE_OPTIONS } from "@/lib/noteMetadata";
import { InputField } from "@/components/common/input/InputField";
import { SuggestionsDropdown } from "@/components/common/suggestions/SuggestionsDropdown";
import { toast } from "sonner";
import { usePasteImages } from "@/hooks/usePasteImages";
import { MetaText } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { SelectExistingImagesDialog } from "@/components/notes/SelectExistingImagesDialog";
import { getImageLabel } from "@/lib/imageLabel";
import { parseTagInput } from "@/domain/notesPage";
import { NoteMetadataFields } from "@/components/notes/NoteMetadataFields";
import { NoteImageAttachments } from "@/components/notes/NoteImageAttachments";

const NOTE_STATUS_OPTIONS = [
  { value: "open", label: "open" },
  { value: "solved", label: "solved" },
  { value: "stale", label: "stale" },
];

export function NotesEditorPanel({
  draft,
  setDraft,
  onSave,
}: {
  draft: Note;
  setDraft: React.Dispatch<React.SetStateAction<Note>>;
  onSave: () => Promise<void>;
}) {
  const rawImages = useLiveQuery(() => db.images.toArray());
  const images: StoredImage[] = useMemo(() => rawImages ?? [], [rawImages]);
  const [tagsInputDraft, setTagsInputDraft] = useState(draft.tags.join(", "));
  const [isTagsFocused, setIsTagsFocused] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const attachRef = useRef<HTMLInputElement>(null);
  const imageById = useMemo(() => new Map(images.map((img) => [img.id, img])), [images]);
  const tagsInput = isTagsFocused ? tagsInputDraft : draft.tags.join(", ");
  const existingLabel = "Existing";
  const attachLabel = "Attach";

  const handleTypeChange = useCallback(
    (value: string) => setDraft((prev) => ({ ...prev, type: value as Note["type"] })),
    [setDraft],
  );
  const handleRoomChange = useCallback(
    (next: string) => setDraft((prev) => ({ ...prev, room: next || undefined })),
    [setDraft],
  );
  const handleDateChange = useCallback(
    (value: string) => setDraft((prev) => ({ ...prev, date: value })),
    [setDraft],
  );
  const handleStatusChange = useCallback(
    (value: string) => setDraft((prev) => ({ ...prev, status: value as Note["status"] })),
    [setDraft],
  );
  const handleTagsChange = useCallback(
    (next: string) => {
      setTagsInputDraft(next);
      setDraft((prev) => ({ ...prev, tags: parseTagInput(next) }));
    },
    [setDraft],
  );

  usePasteImages({
    onImages: (files) => {
      void (async () => {
        try {
          const created = await Promise.all(files.map((f) => addImage(f, f.name)));
          const newIds = created.map((img) => img.id);
          setDraft((prev) => ({
            ...prev,
            imageIds: Array.from(new Set([...prev.imageIds, ...newIds])),
          }));
          toast.success(files.length === 1 ? "Pasted image attached" : "Pasted images attached");
        } catch {
          toast.error("Could not attach pasted image");
        }
      })();
    },
  });

  return (
    <Stack gap="3">
      <SuggestionsDropdown
        onSubmitShortcut={() => {
          void onSave();
        }}
      >
        <InputField
          label="Title"
          value={draft.title}
          onChange={(nextTitle) => setDraft({ ...draft, title: nextTitle })}
          placeholder="Title"
        />
      </SuggestionsDropdown>

      <SuggestionsDropdown>
        <InputField
          value={draft.body}
          onChange={(value) => setDraft({ ...draft, body: value })}
          markdown
          placeholder="Details (markdown supported)…"
        />
      </SuggestionsDropdown>

      <NoteMetadataFields
        typeLabel="Type"
        typeValue={draft.type}
        onTypeChange={handleTypeChange}
        typeOptions={NOTE_TYPE_OPTIONS}
        roomValue={draft.room ?? ""}
        onRoomChange={handleRoomChange}
        roomClearLabel="No room"
        tagsValue={tagsInput}
        onTagsFocus={() => {
          setTagsInputDraft(draft.tags.join(", "));
          setIsTagsFocused(true);
        }}
        onTagsBlur={() => setIsTagsFocused(false)}
        onTagsChange={handleTagsChange}
        dateValue={draft.date ?? ""}
        onDateChange={handleDateChange}
        extraField={
          <Stack as="div" gap="1">
            <MetaText as="p" size="xs" weight="medium" normalCase>
              Status
            </MetaText>
            <DropdownSelect
              value={draft.status}
              onValueChange={handleStatusChange}
              options={NOTE_STATUS_OPTIONS}
              triggerWidth="fit"
            />
          </Stack>
        }
      />

      <NoteImageAttachments
        panel
        heading="Attached images"
        imageIds={draft.imageIds}
        emptyMessage="No images attached to this note."
        resolveLabel={(id) => getImageLabel(imageById.get(id) ?? { name: "Image" })}
        onRemove={(id) => {
          setDraft((prev) => ({
            ...prev,
            imageIds: prev.imageIds.filter((x) => x !== id),
          }));
        }}
      />

      <SelectExistingImagesDialog
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        images={images}
        selectedImageIds={draft.imageIds}
        onToggleImageId={(id, currentlySelected) => {
          setDraft((prev) => {
            const nextIds = currentlySelected
              ? prev.imageIds.filter((imageId) => imageId !== id)
              : Array.from(new Set([...prev.imageIds, id]));
            return { ...prev, imageIds: nextIds };
          });
        }}
      />

      <input
        ref={attachRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          if (!files.length) return;
          const created = await Promise.all(files.map((f) => addImage(f, f.name)));
          const newIds = created.map((img) => img.id);
          setDraft((prev) => ({
            ...prev,
            imageIds: Array.from(new Set([...prev.imageIds, ...newIds])),
          }));
          e.target.value = "";
        }}
      />

      <Inline gap="2" align="center" wrap>
        <Button type="button" variant="outline" size="sm" onClick={() => setImagePickerOpen(true)}>
          {existingLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => attachRef.current?.click()}
        >
          <ImagePlus className="h-3.5 w-3.5" /> {attachLabel}
        </Button>
      </Inline>
    </Stack>
  );
}

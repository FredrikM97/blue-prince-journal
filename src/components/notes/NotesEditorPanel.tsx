import { useMemo, useRef, useState } from "react";
import type { Note } from "@/lib/types";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { RoomDropdown } from "@/components/common/dropdown/RoomDropdown";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { StoredImageView } from "@/components/StoredImageView";
import { useStore } from "@/data/store";
import { ImagePlus, X } from "lucide-react";
import { TYPE_LABEL } from "@/lib/noteMetadata";
import { InputField } from "@/components/common/input/InputField";
import { SuggestionsDropdown } from "@/components/common/dropdown/SuggestionsDropdown";
import { toast } from "sonner";
import { usePasteImages } from "@/hooks/usePasteImages";
import { Dialog, DialogContent, DialogTitle } from "@/components/common/Dialog";
import { MetaText, Text } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";

type ImageSort = "newest" | "oldest" | "name-asc" | "name-desc";

const IMAGE_SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
];

function parseTagsInput(value: string) {
  return value
    .split(/[\s,]+/)
    .map((token) => token.replace(/^#/, "").trim().toLowerCase())
    .filter(Boolean);
}

function getImageLabel(img: { name: string; caption?: string }) {
  return img.caption?.trim() || img.name;
}

const NOTE_STATUS_OPTIONS = [
  { value: "open", label: "open" },
  { value: "solved", label: "solved" },
  { value: "stale", label: "stale" },
];

const NOTE_TYPE_OPTIONS = Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label }));

export function NotesEditorPanel({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: Note;
  setDraft: React.Dispatch<React.SetStateAction<Note>>;
  onSave: () => Promise<void>;
  onCancel: () => void;
}) {
  const addImage = useStore((s) => s.addImage);
  const images = useStore((s) => s.images);
  const [tagsInputDraft, setTagsInputDraft] = useState(draft.tags.join(", "));
  const [isTagsFocused, setIsTagsFocused] = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const attachRef = useRef<HTMLInputElement>(null);
  const imageById = useMemo(() => new Map(images.map((img) => [img.id, img])), [images]);
  const tagsInput = isTagsFocused ? tagsInputDraft : draft.tags.join(", ");

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

      <Inline gap="3" wrap align="start">
        <div>
          <MetaText as="label" size="xs" weight="medium" normalCase>
            Room
          </MetaText>
          <RoomDropdown
            value={draft.room ?? ""}
            onValueChange={(next) => setDraft({ ...draft, room: next || undefined })}
            clearLabel="No room"
          />
        </div>
        <InputField
          label="Tags"
          value={tagsInput}
          onFocus={() => {
            setTagsInputDraft(draft.tags.join(", "));
            setIsTagsFocused(true);
          }}
          onBlur={() => setIsTagsFocused(false)}
          onChange={(next) => {
            setTagsInputDraft(next);
            setDraft({ ...draft, tags: parseTagsInput(next) });
          }}
          placeholder="safe, gem, puzzle"
        />
      </Inline>

      <Inline gap="3" wrap align="start">
        <div>
          <InputField
            label="Date"
            value={draft.date ?? ""}
            onChange={(e) => setDraft({ ...draft, date: e })}
          />
        </div>
        <div>
          <MetaText as="label" size="xs" weight="medium" normalCase>
            Type
          </MetaText>
          <DropdownSelect
            value={draft.type}
            onValueChange={(value) => setDraft({ ...draft, type: value as Note["type"] })}
            options={NOTE_TYPE_OPTIONS}
          />
        </div>
        <div>
          <MetaText as="label" size="xs" weight="medium" normalCase>
            Status
          </MetaText>
          <DropdownSelect
            value={draft.status}
            onValueChange={(value) => setDraft({ ...draft, status: value as Note["status"] })}
            options={NOTE_STATUS_OPTIONS}
          />
        </div>
      </Inline>

      <Stack gap="2" variant="panel-card">
        <Inline gap="2" justify="between" wrap align="center">
          <Text as="span" size="sm" weight="medium">
            Attached images
          </Text>
          <Inline gap="2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImagePickerOpen(true)}
            >
              Use existing
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => attachRef.current?.click()}
            >
              <ImagePlus className="h-3.5 w-3.5" /> Attach image
            </Button>
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
          </Inline>
        </Inline>

        {draft.imageIds.length > 0 ? (
          <Inline gap="2" wrap>
            {draft.imageIds.map((id) => (
              <Stack key={id} gap="1">
                <StoredImageView id={id} className="note-attached-thumb" />
                <MetaText as="p" size="xs" truncate title={id}>
                  {getImageLabel(imageById.get(id) ?? { name: "Image" })}
                </MetaText>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      imageIds: prev.imageIds.filter((x) => x !== id),
                    }))
                  }
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Stack>
            ))}
          </Inline>
        ) : (
          <MetaText>No images attached to this note.</MetaText>
        )}
      </Stack>

      <SelectExistingImagesDialog
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        images={images}
        selectedImageIds={draft.imageIds}
        setDraft={setDraft}
      />

      <Inline gap="2" justify="end" wrap>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="brass" size="sm" onClick={onSave}>
          Save
        </Button>
      </Inline>
    </Stack>
  );
}

function SelectExistingImagesDialog({
  open,
  onOpenChange,
  images,
  selectedImageIds,
  setDraft,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Array<{ id: string; name: string; caption?: string; createdAt: number }>;
  selectedImageIds: string[];
  setDraft: React.Dispatch<React.SetStateAction<Note>>;
}) {
  const [imageSort, setImageSort] = useState<ImageSort>("newest");

  const selectedSet = useMemo(() => new Set(selectedImageIds), [selectedImageIds]);
  const sortedImages = useMemo(() => {
    if (!open) return [];
    const next = [...images];
    next.sort((a, b) => {
      if (imageSort === "newest") return b.createdAt - a.createdAt;
      if (imageSort === "oldest") return a.createdAt - b.createdAt;
      if (imageSort === "name-asc") return a.name.localeCompare(b.name);
      return b.name.localeCompare(a.name);
    });
    return next;
  }, [open, images, imageSort]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="editor">
        <Stack gap="2">
          <Inline gap="3" justify="between">
            <DialogTitle>Attach existing image</DialogTitle>
            <Inline gap="2">
              <DropdownSelect
                value={imageSort}
                onValueChange={(value) => setImageSort(value as ImageSort)}
                options={IMAGE_SORT_OPTIONS}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="shrink-0 border border-input"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-3.5 w-3.5" />
                Close
              </Button>
            </Inline>
          </Inline>
          <MetaText>
            Selected: {selectedImageIds.length} image{selectedImageIds.length === 1 ? "" : "s"}
          </MetaText>
        </Stack>

        {sortedImages.length > 0 ? (
          <Inline gap="3" wrap>
            {sortedImages.map((img) => {
              const selected = selectedSet.has(img.id);
              return (
                <Button
                  key={img.id}
                  type="button"
                  variant="ghost"
                  size="default"
                  className={`note-image-picker-card ${
                    selected ? "note-image-picker-card-selected" : ""
                  }`}
                  onClick={() => {
                    setDraft((prev) => {
                      const nextIds = selected
                        ? prev.imageIds.filter((id) => id !== img.id)
                        : Array.from(new Set([...prev.imageIds, img.id]));
                      return { ...prev, imageIds: nextIds };
                    });
                    toast.success(selected ? "Image detached" : "Image attached");
                  }}
                >
                  <StoredImageView id={img.id} alt={img.name} className="note-image-picker-thumb" />
                  <Inline gap="2" align="center" justify="between">
                    <MetaText
                      as="span"
                      size="xs"
                      truncate
                      title={`${getImageLabel(img)} (${img.name})`}
                    >
                      {getImageLabel(img)}
                    </MetaText>
                    {selected ? <Chip variant="solid">Selected</Chip> : null}
                  </Inline>
                </Button>
              );
            })}
          </Inline>
        ) : (
          <Stack gap="2">
            <MetaText size="sm">
              No available images to attach. Upload or paste a new image first.
            </MetaText>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}

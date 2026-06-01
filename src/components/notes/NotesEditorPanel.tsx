import { useMemo, useState } from "react";
import type { Note } from "@/lib/types";
import { BrassButton, Button, GhostButton } from "@/components/common/Button";
import { RoomDropdown } from "@/components/common/dropdown/RoomDropdown";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { StoredImageView } from "@/components/StoredImageView";
import { useStore } from "@/data/store";
import { ImagePlus, X } from "lucide-react";
import { TYPE_LABEL } from "@/lib/noteMetadata";
import { DetailsField } from "@/components/common/input/DetailsField";
import { InputField } from "@/components/common/input/InputField";
import { SuggestionsDropdown } from "@/components/common/dropdown/SuggestionsDropdown";
import { toast } from "sonner";
import { usePasteImages } from "@/hooks/usePasteImages";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";

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
    <div className="note-editor-wrap">
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
        <DetailsField
          value={draft.body}
          onChange={(value) => setDraft({ ...draft, body: value })}
          placeholder="Details (markdown supported)…"
        />
      </SuggestionsDropdown>

      <div className="note-editor-grid-2">
        <div>
          <label className="capture-label">Room</label>
          <RoomDropdown
            value={draft.room ?? ""}
            onValueChange={(next) => setDraft({ ...draft, room: next || undefined })}
            clearLabel="No room"
          />
        </div>
        <div>
          <label className="capture-label">Tags</label>
          <input
            value={tagsInput}
            onFocus={() => {
              setTagsInputDraft(draft.tags.join(", "));
              setIsTagsFocused(true);
            }}
            onBlur={() => setIsTagsFocused(false)}
            onChange={(e) => {
              const next = e.target.value;
              setTagsInputDraft(next);
              setDraft({ ...draft, tags: parseTagsInput(next) });
            }}
            placeholder="safe, gem, puzzle"
            className="input-base"
          />
        </div>
      </div>

      <div className="note-editor-grid-3">
        <div>
          <label className="capture-label">Date</label>
          <InputField
            value={draft.date ?? ""}
            onChange={(e) => setDraft({ ...draft, date: e })}
            label={""}
          />
        </div>
        <div>
          <label className="capture-label">Type</label>
          <DropdownSelect
            value={draft.type}
            onValueChange={(value) => setDraft({ ...draft, type: value as Note["type"] })}
            options={NOTE_TYPE_OPTIONS}
          />
        </div>
        <div>
          <label className="capture-label">Status</label>
          <DropdownSelect
            value={draft.status}
            onValueChange={(value) => setDraft({ ...draft, status: value as Note["status"] })}
            options={NOTE_STATUS_OPTIONS}
          />
        </div>
      </div>

      <div className="note-editor-images-card">
        <div className="note-editor-images-header">
          <span className="note-editor-images-label">Attached images</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImagePickerOpen(true)}
            >
              Use existing
            </Button>
            <label className="note-editor-attach-label">
              <span className="inline-flex items-center gap-1">
                <ImagePlus className="h-3.5 w-3.5" /> Attach image
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
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
            </label>
          </div>
        </div>

        {draft.imageIds.length > 0 ? (
          <div className="note-editor-images-grid">
            {draft.imageIds.map((id) => (
              <div key={id} className="note-editor-image-wrap">
                <StoredImageView id={id} className="note-attached-thumb" />
                <p className="note-attached-thumb-label" title={id}>
                  {getImageLabel(imageById.get(id) ?? { name: "Image" })}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      imageIds: prev.imageIds.filter((x) => x !== id),
                    }))
                  }
                  className="note-editor-image-remove"
                  aria-label="Remove image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No images attached to this note.</p>
        )}
      </div>

      <SelectExistingImagesDialog
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        images={images}
        selectedImageIds={draft.imageIds}
        setDraft={setDraft}
      />

      <div className="note-editor-footer">
        <GhostButton onClick={onCancel}>Cancel</GhostButton>
        <BrassButton size="sm" onClick={onSave}>
          Save
        </BrassButton>
      </div>
    </div>
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
        <div className="note-dialog-header">
          <div className="flex items-center justify-between gap-3">
            <DialogTitle>Attach existing image</DialogTitle>
            <div className="flex items-center gap-2">
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
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {selectedImageIds.length} image{selectedImageIds.length === 1 ? "" : "s"}
          </p>
        </div>

        {sortedImages.length > 0 ? (
          <div className="note-image-picker-grid">
            {sortedImages.map((img) => {
              const selected = selectedSet.has(img.id);
              return (
                <button
                  key={img.id}
                  type="button"
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
                  <div className="note-image-picker-caption">
                    <p
                      className="note-image-picker-name"
                      title={`${getImageLabel(img)} (${img.name})`}
                    >
                      {getImageLabel(img)}
                    </p>
                    {selected ? <span className="note-image-picker-badge">Selected</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="px-6 py-8 text-sm text-muted-foreground">
            No available images to attach. Upload or paste a new image first.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

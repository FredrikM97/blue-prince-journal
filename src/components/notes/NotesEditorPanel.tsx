import { useMemo, useRef, useState } from "react";
import type { Note, StoredImage } from "@/lib/types";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { RoomDropdown } from "@/components/common/dropdown/RoomDropdown";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { db } from "@/data/db";
import { addImage } from "@/data/mutations";
import { useLiveQuery } from "dexie-react-hooks";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { TYPE_LABEL } from "@/lib/noteMetadata";
import { InputField } from "@/components/common/input/InputField";
import { SuggestionsDropdown } from "@/components/common/dropdown/SuggestionsDropdown";
import { toast } from "sonner";
import { usePasteImages } from "@/hooks/usePasteImages";
import { Dialog, DialogContent, DialogTitle } from "@/components/common/Dialog";
import { MetaText, Text } from "@/components/common/Typography";
import { Grid, Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { ImageCard } from "@/components/common/ImageCard";

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

      <Inline gap="2" wrap align="start">
        <Stack as="div" gap="1">
          <MetaText as="p" size="xs" weight="medium" normalCase>
            Type
          </MetaText>
          <DropdownSelect
            value={draft.type}
            onValueChange={(value) => setDraft({ ...draft, type: value as Note["type"] })}
            options={NOTE_TYPE_OPTIONS}
            triggerWidth="fit"
          />
        </Stack>
        <Stack as="div" gap="1">
          <MetaText as="p" size="xs" weight="medium" normalCase>
            Room
          </MetaText>
          <RoomDropdown
            value={draft.room ?? ""}
            onValueChange={(next) => setDraft({ ...draft, room: next || undefined })}
            clearLabel="No room"
            triggerWidth="fit"
          />
        </Stack>
        <Stack as="div" gap="1">
          <MetaText as="p" size="xs" weight="medium" normalCase>
            Status
          </MetaText>
          <DropdownSelect
            value={draft.status}
            onValueChange={(value) => setDraft({ ...draft, status: value as Note["status"] })}
            options={NOTE_STATUS_OPTIONS}
            triggerWidth="fit"
          />
        </Stack>
      </Inline>

      <Inline gap="2" wrap align="start">
        <Stack as="div" gap="1">
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
            size="sm"
            width="compact"
          />
        </Stack>
        <Stack as="div" gap="1">
          <InputField
            label="Date"
            value={draft.date ?? ""}
            onChange={(e) => setDraft({ ...draft, date: e })}
            size="sm"
            width="compact"
          />
        </Stack>
      </Inline>

      <Stack gap="2" variant="panel-card">
        <Inline gap="2" justify="between" wrap align="center">
          <Text as="span" size="sm" weight="medium">
            Attached images
          </Text>
        </Inline>

        {draft.imageIds.length > 0 ? (
          <Stack gap="0" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
            {draft.imageIds.map((id) => (
              <ImageCard
                key={id}
                id={id}
                label={getImageLabel(imageById.get(id) ?? { name: "Image" })}
                size="sm"
                onRemove={(e) => {
                  e.stopPropagation();
                  setDraft((prev) => ({
                    ...prev,
                    imageIds: prev.imageIds.filter((x) => x !== id),
                  }));
                }}
              />
            ))}
          </Stack>
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
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;

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

  const totalPages = Math.max(1, Math.ceil(sortedImages.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageImages = sortedImages.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  function handleSortChange(value: ImageSort) {
    setImageSort(value);
    setPage(0);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="wide" showClose={false}>
        <Inline gap="3" justify="between" align="center">
          <DialogTitle>Attach existing image</DialogTitle>
          <Inline gap="2" align="center">
            <Inline gap="1" align="center">
              <Button
                type="button"
                variant="secondary"
                size="icon-h2"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <MetaText size="xs">
                {safePage + 1} / {totalPages}
              </MetaText>
              <Button
                type="button"
                variant="secondary"
                size="icon-h2"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={safePage === totalPages - 1}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Inline>
            <DropdownSelect
              value={imageSort}
              onValueChange={(value) => handleSortChange(value as ImageSort)}
              options={IMAGE_SORT_OPTIONS}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-3.5 w-3.5" />
              Close
            </Button>
          </Inline>
        </Inline>
        <MetaText>
          Selected: {selectedImageIds.length} image{selectedImageIds.length === 1 ? "" : "s"}
        </MetaText>

        <Stack variant="dialog-scroll-body-tall" gap="0">
          {sortedImages.length > 0 ? (
            <Grid variant="auto-fill-card" gap="3">
              {pageImages.map((img) => {
                const selected = selectedSet.has(img.id);
                return (
                  <ImageCard
                    key={img.id}
                    id={img.id}
                    label={getImageLabel(img)}
                    selected={selected}
                    badge={selected ? <Chip variant="solid">Selected</Chip> : null}
                    onClick={() => {
                      setDraft((prev) => {
                        const nextIds = selected
                          ? prev.imageIds.filter((id) => id !== img.id)
                          : Array.from(new Set([...prev.imageIds, img.id]));
                        return { ...prev, imageIds: nextIds };
                      });
                      toast.success(selected ? "Image detached" : "Image attached");
                    }}
                  />
                );
              })}
            </Grid>
          ) : (
            <MetaText size="sm">
              No available images to attach. Upload or paste a new image first.
            </MetaText>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

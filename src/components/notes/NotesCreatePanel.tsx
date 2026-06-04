import { useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useStore } from "@/data/store";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/db";
import { saveNote, saveTodo, createFromCapture } from "@/data/mutations";
import type { Note, Todo } from "@/lib/types";
import { Button } from "@/components/common/Button";
import { RoomDropdown } from "@/components/common/dropdown/RoomDropdown";
import { Tabs, TabsList, TabsTrigger } from "@/components/common/Tabs";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { toast } from "sonner";
import { usePasteImages } from "@/hooks/usePasteImages";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import type { NoteType, Priority } from "@/lib/types";
import { NOTE_TYPES } from "@/lib/noteMetadata";
import { ImageCard } from "@/components/common/ImageCard";
import { PendingImageList } from "@/components/common/input/PendingImageList";
import { InputField } from "@/components/common/input/InputField";
import { SuggestionsDropdown } from "@/components/common/dropdown/SuggestionsDropdown";
import { SidePanel } from "@/components/common/SidePanel";
import { MetaText, Text } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { usePageLayoutMobileDrawerControls } from "@/components/common/PageLayout";
import { Dialog, DialogContent, DialogTitle } from "@/components/common/Dialog";
import { Chip } from "@/components/common/Chip";

const NOTE_PRIORITY_OPTIONS = [
  { value: "high", label: "High" },
  { value: "med", label: "Medium" },
  { value: "low", label: "Low" },
];

const IMAGE_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
];

type ImageSort = "newest" | "oldest" | "name-asc" | "name-desc";

type NotesStoreSlice = ReturnType<typeof useNotesStoreSlice>;
type NotesFormState = ReturnType<typeof useNotesFormState>;

function useNotesStoreSlice() {
  const open = useStore((s) => s.captureOpen);
  const close = useStore((s) => s.closeCapture);
  const kind = useStore((s) => s.captureDefault);
  const prefill = useStore((s) => s.capturePrefill);
  const prefillRoom = useStore((s) => s.capturePrefillRoom);
  const prefillType = useStore((s) => s.capturePrefillType);
  const prefillTags = useStore((s) => s.capturePrefillTags);
  const prefillBody = useStore((s) => s.capturePrefillBody);
  const prefillImageIds = useStore((s) => s.capturePrefillImageIds);
  const prefillPriority = useStore((s) => s.capturePrefillPriority);
  const editNoteId = useStore((s) => s.captureEditNoteId);
  const editTodoId = useStore((s) => s.captureEditTodoId);
  const notes: Note[] = useLiveQuery(() => db.notes.toArray()) ?? [];
  const todos: Todo[] = useLiveQuery(() => db.todos.toArray()) ?? [];
  const images = useLiveQuery(() => db.images.toArray()) ?? [];
  const returnTo = useStore((s) => s.captureReturnTo);

  return {
    open,
    close,
    kind,
    prefill,
    prefillRoom,
    prefillType,
    prefillTags,
    prefillBody,
    prefillImageIds,
    prefillPriority,
    editNoteId,
    editTodoId,
    saveNote,
    saveTodo,
    notes,
    todos,
    images,
    returnTo,
    create: createFromCapture,
  };
}

function useNotesFormState({
  kind,
  prefill,
  prefillRoom,
  prefillType,
  prefillTags,
  prefillBody,
  prefillImageIds,
  prefillPriority,
  defaultNoteType,
}: {
  kind: "note" | "todo";
  prefill: string;
  prefillRoom?: string;
  prefillType?: NoteType;
  prefillTags?: string;
  prefillBody?: string;
  prefillImageIds?: string[];
  prefillPriority?: Priority;
  defaultNoteType?: NoteType;
}) {
  const [mode, setMode] = useState<"note" | "todo">(kind);
  const [title, setTitle] = useState(prefill);
  const [type, setType] = useState<NoteType>(prefillType ?? defaultNoteType ?? "observation");
  const [room, setRoom] = useState<string>(prefillRoom ?? "");
  const [dateInput, setDateInput] = useState("");
  const [tagsInput, setTagsInput] = useState(prefillTags ?? "");
  const [priority, setPriority] = useState<Priority>(prefillPriority ?? "med");
  const [body, setBody] = useState(prefillBody ?? "");
  const [selectedImageIds, setSelectedImageIds] = useState<string[]>(prefillImageIds ?? []);
  const [pendingImages, setPendingImages] = useState<Blob[]>([]);

  function resetAfterSubmit() {
    setTitle("");
    setBody("");
    setDateInput("");
    setSelectedImageIds([]);
    setPendingImages([]);
  }

  return {
    mode,
    setMode,
    title,
    setTitle,
    type,
    setType,
    room,
    setRoom,
    dateInput,
    setDateInput,
    tagsInput,
    setTagsInput,
    priority,
    setPriority,
    body,
    setBody,
    selectedImageIds,
    setSelectedImageIds,
    pendingImages,
    setPendingImages,
    resetAfterSubmit,
  };
}

function NotesRoomField({
  room,
  setRoom,
}: {
  room: string;
  setRoom: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <Stack as="div" gap="1">
      <MetaText as="p" size="xs" weight="medium" normalCase>
        Room
      </MetaText>
      <RoomDropdown value={room} onValueChange={setRoom} triggerWidth="fit" />
    </Stack>
  );
}

function NotesTypeField({
  type,
  setType,
}: {
  type: NoteType;
  setType: React.Dispatch<React.SetStateAction<NoteType>>;
}) {
  return (
    <Stack as="div" gap="1">
      <MetaText as="p" size="xs" weight="medium" normalCase>
        Type / category
      </MetaText>
      <DropdownSelect
        value={type}
        onValueChange={(v) => setType(v as NoteType)}
        options={NOTE_TYPES}
        triggerWidth="fit"
      />
    </Stack>
  );
}

function NotesPriorityField({
  priority,
  setPriority,
}: {
  priority: Priority;
  setPriority: React.Dispatch<React.SetStateAction<Priority>>;
}) {
  return (
    <Stack as="div" gap="1">
      <MetaText as="p" size="xs" weight="medium" normalCase>
        Priority
      </MetaText>
      <DropdownSelect
        value={priority}
        onValueChange={(v) => setPriority(v as Priority)}
        options={NOTE_PRIORITY_OPTIONS}
        triggerWidth="fit"
      />
    </Stack>
  );
}

function NotesModeTabs({
  mode,
  setMode,
}: {
  mode: "note" | "todo";
  setMode: React.Dispatch<React.SetStateAction<"note" | "todo">>;
}) {
  return (
    <Tabs className="shrink-0" value={mode} onValueChange={(v) => setMode(v as "note" | "todo")}>
      <TabsList className="grid h-9 w-full grid-cols-2 rounded-md border border-input bg-muted/30 p-0.5">
        <TabsTrigger className="h-7 w-full rounded-sm text-xs" value="note">
          📝 Note
        </TabsTrigger>
        <TabsTrigger className="h-7 w-full rounded-sm text-xs" value="todo">
          ✓ Todo
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function NotesMetaFields({
  mode,
  type,
  setType,
  priority,
  setPriority,
  room,
  setRoom,
  tagsInput,
  setTagsInput,
  dateInput,
  setDateInput,
}: {
  mode: "note" | "todo";
  type: NoteType;
  setType: React.Dispatch<React.SetStateAction<NoteType>>;
  priority: Priority;
  setPriority: React.Dispatch<React.SetStateAction<Priority>>;
  room: string;
  setRoom: React.Dispatch<React.SetStateAction<string>>;
  tagsInput: string;
  setTagsInput: React.Dispatch<React.SetStateAction<string>>;
  dateInput: string;
  setDateInput: React.Dispatch<React.SetStateAction<string>>;
}) {
  if (mode === "note") {
    return (
      <Stack gap="2">
        <Inline gap="2" wrap align="start">
          <NotesTypeField type={type} setType={setType} />
          <NotesRoomField room={room} setRoom={setRoom} />
        </Inline>
        <Inline gap="2" wrap align="start">
          <NotesTagsField tagsInput={tagsInput} setTagsInput={setTagsInput} />
          <Stack as="div" gap="1">
            <InputField
              label="Date"
              value={dateInput}
              onChange={setDateInput}
              placeholder="Spring 1, Day 3"
              size="sm"
              width="compact"
            />
          </Stack>
        </Inline>
      </Stack>
    );
  }

  return (
    <Stack gap="2">
      <Inline gap="2" wrap align="start">
        <NotesPriorityField priority={priority} setPriority={setPriority} />
        <NotesRoomField room={room} setRoom={setRoom} />
      </Inline>
      <Inline gap="2" wrap align="start">
        <NotesTagsField tagsInput={tagsInput} setTagsInput={setTagsInput} />
      </Inline>
    </Stack>
  );
}

function NotesTagsField({
  tagsInput,
  setTagsInput,
}: {
  tagsInput: string;
  setTagsInput: React.Dispatch<React.SetStateAction<string>>;
}) {
  return (
    <Stack as="div" gap="1">
      <InputField
        label="Tags"
        value={tagsInput}
        onChange={setTagsInput}
        placeholder="safe, gem, puzzle"
        size="sm"
        width="compact"
      />
    </Stack>
  );
}

function NotesFooterActions({
  submit,
  close,
  openExistingPicker,
  setPendingImages,
}: {
  submit: (keepOpen: boolean) => void | Promise<void>;
  close: () => void;
  openExistingPicker: () => void;
  setPendingImages: React.Dispatch<React.SetStateAction<Blob[]>>;
}) {
  const attachRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => attachRef.current?.click()}
        >
          <ImagePlus className="h-3.5 w-3.5" /> Attach
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={openExistingPicker}>
          Existing
        </Button>
        <input
          ref={attachRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            setPendingImages((pending) => [...pending, ...files]);
            e.target.value = "";
          }}
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={close}>
          Cancel
        </Button>
        <Button variant="ghost" size="sm" onClick={() => submit(true)}>
          Save + next
        </Button>
        <Button variant="brass" size="sm" onClick={() => submit(false)}>
          Save
        </Button>
      </div>
    </div>
  );
}

function useNotesGlobalEffects({
  open,
  setPendingImages,
}: {
  open: boolean;
  setPendingImages: React.Dispatch<React.SetStateAction<Blob[]>>;
}) {
  usePasteImages({
    enabled: open,
    onImages: (files) => setPendingImages((p) => [...p, ...files]),
  });
}

function parseTags(tagsInput: string) {
  return tagsInput
    .split(/[\s,]+/)
    .map((token) => token.replace(/^#/, "").trim().toLowerCase())
    .filter(Boolean);
}

// ── Todo submit ────────────────────────────────────────────────────────────
function useTodoSubmit({
  saveTodo,
  create,
  editTodoId,
  existingTodos,
  closeWithReturn,
  title,
  body,
  selectedImageIds,
  room,
  tagsInput,
  priority,
  resetAfterSubmit,
}: {
  saveTodo: NotesStoreSlice["saveTodo"];
  create: NotesStoreSlice["create"];
  editTodoId: NotesStoreSlice["editTodoId"];
  existingTodos: NotesStoreSlice["todos"];
  closeWithReturn: () => Promise<void>;
  title: NotesFormState["title"];
  body: NotesFormState["body"];
  selectedImageIds: NotesFormState["selectedImageIds"];
  room: NotesFormState["room"];
  tagsInput: NotesFormState["tagsInput"];
  priority: NotesFormState["priority"];
  resetAfterSubmit: NotesFormState["resetAfterSubmit"];
}) {
  return async function submit(keepOpen: boolean) {
    if (!title.trim()) {
      toast.error("Add a title before saving.");
      return;
    }
    const tags = parseTags(tagsInput);

    if (editTodoId) {
      const existing = existingTodos.find((t) => t.id === editTodoId);
      if (existing) {
        await saveTodo({
          ...existing,
          title: title.trim() || "Untitled",
          room: room || undefined,
          tags,
          priority,
          body: body.trim() || undefined,
          imageIds: selectedImageIds,
        });
        toast.success("Todo updated");
        await closeWithReturn();
        return;
      }
    }

    await create(title || "Untitled", {
      kind: "todo",
      imageIds: selectedImageIds,
      body,
      room: room || undefined,
      tags,
      priority,
    });
    toast.success("Todo added");
    if (keepOpen) {
      resetAfterSubmit();
    } else {
      await closeWithReturn();
    }
  };
}

// ── Note submit ────────────────────────────────────────────────────────────
function useNoteSubmit({
  saveNote,
  create,
  editNoteId,
  existingNotes,
  closeWithReturn,
  title,
  pendingImages,
  selectedImageIds,
  body,
  type,
  room,
  dateInput,
  tagsInput,
  resetAfterSubmit,
}: {
  saveNote: NotesStoreSlice["saveNote"];
  create: NotesStoreSlice["create"];
  editNoteId: NotesStoreSlice["editNoteId"];
  existingNotes: NotesStoreSlice["notes"];
  closeWithReturn: () => Promise<void>;
  title: NotesFormState["title"];
  pendingImages: NotesFormState["pendingImages"];
  selectedImageIds: NotesFormState["selectedImageIds"];
  body: NotesFormState["body"];
  type: NotesFormState["type"];
  room: NotesFormState["room"];
  dateInput: NotesFormState["dateInput"];
  tagsInput: NotesFormState["tagsInput"];
  resetAfterSubmit: NotesFormState["resetAfterSubmit"];
}) {
  return async function submit(keepOpen: boolean) {
    if (!title.trim() && pendingImages.length === 0) {
      toast.error("Add a title or attach an image before saving.");
      return;
    }
    const tags = parseTags(tagsInput);

    if (editNoteId) {
      const existing = existingNotes.find((n) => n.id === editNoteId);
      if (existing) {
        await saveNote({
          ...existing,
          title: title.trim() || "Untitled",
          body: body.trim(),
          type,
          room: room || undefined,
          tags,
          date: dateInput || existing.date,
          imageIds: selectedImageIds,
        });
        toast.success("Note updated");
        await closeWithReturn();
        return;
      }
    }

    // Pass title raw so #tag @room shortcuts inside still parse,
    // but explicit fields override.
    await create(title || "Untitled", {
      kind: "note",
      imageIds: selectedImageIds,
      imageBlobs: pendingImages,
      body,
      type,
      date: dateInput || undefined,
      room: room || undefined,
      tags,
    });
    toast.success("Note added");
    if (keepOpen) {
      resetAfterSubmit();
    } else {
      await closeWithReturn();
    }
  };
}

export function NotesCreatePanel({ defaultNoteType }: { defaultNoteType?: NoteType }) {
  const navigate = useNavigate();
  const mobileDrawerControls = usePageLayoutMobileDrawerControls();
  const store = useNotesStoreSlice();
  const form = useNotesFormState({
    kind: store.kind,
    prefill: store.prefill,
    prefillRoom: store.prefillRoom,
    prefillType: store.prefillType,
    prefillTags: store.prefillTags,
    prefillBody: store.prefillBody,
    prefillImageIds: store.prefillImageIds,
    prefillPriority: store.prefillPriority,
    defaultNoteType,
  });
  const [imagePickerOpen, setImagePickerOpen] = useState(false);

  useNotesGlobalEffects({
    open: store.open,
    setPendingImages: form.setPendingImages,
  });

  const closeWithReturn = async () => {
    const target = store.returnTo;
    store.close();
    if (target) {
      await navigate({ to: target as "/" });
    }
  };

  const closeCapturePanel = () => {
    if (mobileDrawerControls?.isPageLayoutMobile) {
      mobileDrawerControls.closeMobileDrawer();
    }
    void closeWithReturn();
  };

  const submitTodo = useTodoSubmit({
    saveTodo: store.saveTodo,
    create: store.create,
    editTodoId: store.editTodoId,
    existingTodos: store.todos,
    closeWithReturn,
    title: form.title,
    body: form.body,
    selectedImageIds: form.selectedImageIds,
    room: form.room,
    tagsInput: form.tagsInput,
    priority: form.priority,
    resetAfterSubmit: form.resetAfterSubmit,
  });

  const submitNote = useNoteSubmit({
    saveNote: store.saveNote,
    create: store.create,
    editNoteId: store.editNoteId,
    existingNotes: store.notes,
    closeWithReturn,
    title: form.title,
    pendingImages: form.pendingImages,
    selectedImageIds: form.selectedImageIds,
    body: form.body,
    type: form.type,
    room: form.room,
    dateInput: form.dateInput,
    tagsInput: form.tagsInput,
    resetAfterSubmit: form.resetAfterSubmit,
  });

  const submit = form.mode === "todo" ? submitTodo : submitNote;

  const isEditing = Boolean(store.editNoteId ?? store.editTodoId);

  let panelTitle = "New note";
  if (form.mode === "todo") {
    panelTitle = "New todo";
  }
  if (isEditing && form.mode === "note") {
    panelTitle = "Edit note";
  }
  if (isEditing && form.mode === "todo") {
    panelTitle = "Edit todo";
  }

  let panelKey = "capture:new:note";
  if (form.mode === "todo") {
    panelKey = "capture:new:todo";
  }
  if (store.editNoteId) {
    panelKey = `capture:edit-note:${store.editNoteId}`;
  }
  if (store.editTodoId) {
    panelKey = `capture:edit-todo:${store.editTodoId}`;
  }

  const content = (
    <>
      {!isEditing && <NotesModeTabs mode={form.mode} setMode={form.setMode} />}

      <Stack gap="3">
        <SuggestionsDropdown onSubmitShortcut={submit}>
          <InputField
            label="Title"
            value={form.title}
            onChange={form.setTitle}
            placeholder={form.mode === "todo" ? "Check Den bookshelf" : "Parlor safe = 4271"}
            size="lg"
            autoFocus
          />
        </SuggestionsDropdown>

        <SuggestionsDropdown>
          <InputField
            value={form.body}
            onChange={form.setBody}
            markdown
            placeholder={
              form.mode === "todo" ? "Details about this todo…" : "Longer note, paste evidence…"
            }
          />
        </SuggestionsDropdown>

        <NotesMetaFields
          mode={form.mode}
          type={form.type}
          setType={form.setType}
          priority={form.priority}
          setPriority={form.setPriority}
          room={form.room}
          setRoom={form.setRoom}
          tagsInput={form.tagsInput}
          setTagsInput={form.setTagsInput}
          dateInput={form.dateInput}
          setDateInput={form.setDateInput}
        />

        <PendingImageList
          images={form.pendingImages}
          onRemove={(index) => form.setPendingImages((p) => p.filter((_, j) => j !== index))}
        />

        <Stack gap="1">
          <MetaText>Selected existing images: {form.selectedImageIds.length}</MetaText>
          {form.selectedImageIds.length > 0 && (
            <Stack variant="image-card-strip" gap="0">
              {form.selectedImageIds.map((id) => {
                const img = store.images.find((item) => item.id === id);
                if (!img) return null;
                return (
                  <ImageCard
                    key={id}
                    id={id}
                    label={getImageLabel(img)}
                    size="sm"
                    onRemove={(e) => {
                      e.stopPropagation();
                      form.setSelectedImageIds((prev) => prev.filter((imageId) => imageId !== id));
                    }}
                  />
                );
              })}
            </Stack>
          )}
        </Stack>
      </Stack>

      <SelectExistingImagesDialog
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        images={store.images}
        selectedImageIds={form.selectedImageIds}
        setSelectedImageIds={form.setSelectedImageIds}
      />

      <NotesFooterActions
        submit={submit}
        close={closeCapturePanel}
        openExistingPicker={() => setImagePickerOpen(true)}
        setPendingImages={form.setPendingImages}
      />
    </>
  );

  if (!store.open) {
    return (
      <Stack variant="page-layout-panel" gap="2">
        <Text size="sm" tone="muted">
          Press N or use the add button to create a note.
        </Text>
      </Stack>
    );
  }

  return (
    <SidePanel.Right title={panelTitle} onClose={closeCapturePanel} panelKey={panelKey}>
      {content}
    </SidePanel.Right>
  );
}

function getImageLabel(img: { name: string; caption?: string }): string {
  return img.caption?.trim() || img.name;
}

function SelectExistingImagesDialog({
  open,
  onOpenChange,
  images,
  selectedImageIds,
  setSelectedImageIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: Array<{ id: string; name: string; caption?: string; createdAt: number }>;
  selectedImageIds: string[];
  setSelectedImageIds: React.Dispatch<React.SetStateAction<string[]>>;
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
                size="icon"
                className="h-7 w-7"
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
                size="icon"
                className="h-7 w-7"
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

        <Stack variant="dialog-scroll-body" gap="0">
          {sortedImages.length > 0 ? (
            <Stack variant="note-image-picker-grid" gap="0">
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
                      setSelectedImageIds((prev) => {
                        if (selected) return prev.filter((id) => id !== img.id);
                        return Array.from(new Set([...prev, img.id]));
                      });
                      toast.success(selected ? "Image detached" : "Image attached");
                    }}
                  />
                );
              })}
            </Stack>
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

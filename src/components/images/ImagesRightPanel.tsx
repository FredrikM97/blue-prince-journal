import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { PagedNotesList } from "@/components/common/PagedNotesList";
import { StoredImageView } from "@/components/StoredImageView";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { SidePanel } from "@/components/common/SidePanel";
import { Text } from "@/components/common/Typography";
import { InputField } from "@/components/common/input/InputField";
import type { Note, StoredImage } from "@/lib/types";

// Image styling containers (requires wrapper for CSS styling)
function ImagePreviewContainer({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap="0" className="images-detail-preview">
      {children}
    </Stack>
  );
}

function ImageZoomPreview({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap="0" className="images-zoom-preview">
      {children}
    </Stack>
  );
}

function getImageLabel(img: StoredImage): string {
  return img.caption?.trim() || img.name;
}

/**
 * Right panel wrapper for image details and actions.
 */
export function ImagesRightPanel({
  img,
  relatedNotes,
  previewOpen,
  setPreviewOpen,
  onPrev,
  onNext,
  onClose,
  onDelete,
  onSaveLabel,
}: {
  img: StoredImage | null;
  relatedNotes: Note[];
  previewOpen: boolean;
  setPreviewOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onDelete: () => void;
  onSaveLabel: (label: string) => Promise<void>;
}) {
  if (!img) {
    return (
      <SidePanel.Right title="Image" panelKey="image-empty">
        {/* eslint-disable-next-line no-restricted-syntax */}
        <div className="flex items-center justify-center py-8">
          <Text tone="muted" size="sm">
            Select an image from the library to view details
          </Text>
        </div>
      </SidePanel.Right>
    );
  }

  return (
    <ImagesInspectorPanel
      key={img.id}
      img={img}
      relatedNotes={relatedNotes}
      previewOpen={previewOpen}
      setPreviewOpen={setPreviewOpen}
      onPrev={onPrev}
      onNext={onNext}
      onClose={onClose}
      onDelete={onDelete}
      onSaveLabel={onSaveLabel}
    />
  );
}

function ImagesInspectorPanel({
  img,
  relatedNotes,
  previewOpen,
  setPreviewOpen,
  onPrev,
  onNext,
  onClose,
  onDelete,
  onSaveLabel,
}: {
  img: StoredImage;
  relatedNotes: Note[];
  previewOpen: boolean;
  setPreviewOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onDelete: () => void;
  onSaveLabel: (label: string) => Promise<void>;
}) {
  const [labelInput, setLabelInput] = useState(getImageLabel(img));
  const [savingLabel, setSavingLabel] = useState(false);

  return (
    <>
      <SidePanel.Right
        title={getImageLabel(img) || "Image"}
        subtitle={`${relatedNotes.length} related note${relatedNotes.length === 1 ? "" : "s"}`}
        onClose={onClose}
        onExpand={() => setPreviewOpen(true)}
        panelKey={`image:${img.id}`}
      >
        <Stack gap="2">
          <Inline gap="2">
            <Button variant="outline" size="icon" onClick={onPrev} aria-label="Previous image">
              <ChevronLeft />
            </Button>
            <Button variant="outline" size="icon" onClick={onNext} aria-label="Next image">
              <ChevronRight />
            </Button>
          </Inline>

          <ImagePreviewContainer>
            <StoredImageView id={img.id} alt={img.name} className="images-detail-preview-image" />
          </ImagePreviewContainer>
        </Stack>

        <Stack gap="3">
          <Stack gap="1.5">
            <Text as="label" size="xs" weight="medium" tone="muted">
              Label
            </Text>
            <Inline gap="2">
              <InputField
                value={labelInput}
                onChange={setLabelInput}
                placeholder={img.name}
                size="sm"
                grow
              />
              <Button
                variant="outline"
                size="sm"
                disabled={savingLabel || labelInput.trim() === getImageLabel(img)}
                onClick={async () => {
                  setSavingLabel(true);
                  try {
                    await onSaveLabel(labelInput);
                  } finally {
                    setSavingLabel(false);
                  }
                }}
              >
                Save
              </Button>
            </Inline>
          </Stack>

          <PagedNotesList
            notes={relatedNotes}
            title="Details from notes"
            emptyLabel="No notes currently reference this image."
          />

          <Inline gap="2" justify="between" wrap align="center">
            <Button variant="ghost" tone="destructive" onClick={onDelete}>
              <Text as="span" variant="sr-only">
                Delete image
              </Text>
              <Trash2 />
            </Button>
          </Inline>
        </Stack>
      </SidePanel.Right>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent variant="expand">
          <DialogHeader>
            <DialogTitle>{getImageLabel(img)}</DialogTitle>
          </DialogHeader>
          <ImageZoomPreview>
            <StoredImageView id={img.id} alt={img.name} className="images-zoom-preview-image" />
          </ImageZoomPreview>
        </DialogContent>
      </Dialog>
    </>
  );
}

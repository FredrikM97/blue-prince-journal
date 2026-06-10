import { useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { PagedNotesList } from "@/components/map/PagedNotesList";
import { StoredImageView } from "@/components/common/StoredImageView";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { SidePanelRight } from "@/components/common/SidePanel";
import { Text } from "@/components/common/Typography";
import { InputField } from "@/components/common/input/InputField";
import { ImageZoomDialogContent } from "@/components/images/ImageZoomDialogContent";
import type { Note, StoredImage } from "@/lib/types";
import { getImageLabel } from "@/lib/imageLabel";

// Image styling containers (requires wrapper for CSS styling)
function ImagePreviewContainer({ children }: { children: React.ReactNode }) {
  return (
    <Stack gap="0" className="mx-auto aspect-square w-full max-w-[24rem] overflow-hidden rounded bg-background">
      {children}
    </Stack>
  );
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
      <SidePanelRight title="Image" panelKey="image-empty">
        <Stack className="flex items-center justify-center py-8" gap="0">
          <Text tone="muted" size="sm">
            Select an image from the library to view details
          </Text>
        </Stack>
      </SidePanelRight>
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
      <SidePanelRight
        title={getImageLabel(img) || "Image"}
        subtitle={`${relatedNotes.length} related note${relatedNotes.length === 1 ? "" : "s"}`}
        headerActions={
          <Inline gap="1" align="center">
            <Button variant="ghost" size="icon" onClick={onPrev} aria-label="Previous image">
              <ChevronLeft />
            </Button>
            <Button variant="ghost" size="icon" onClick={onNext} aria-label="Next image">
              <ChevronRight />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              tone="destructive"
              onClick={onDelete}
              aria-label="Delete image"
            >
              <Trash2 />
            </Button>
          </Inline>
        }
        onClose={onClose}
        onExpand={() => setPreviewOpen(true)}
        panelKey={`image:${img.id}`}
      >
        <Stack gap="2">
          <ImagePreviewContainer>
            <StoredImageView id={img.id} alt={img.name} className="h-full w-full object-cover" />
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
            cardVariant="default"
          />
        </Stack>
      </SidePanelRight>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent variant="expand">
          <DialogHeader>
            <DialogTitle>{getImageLabel(img)}</DialogTitle>
          </DialogHeader>
          <ImageZoomDialogContent key={img.id} imageId={img.id} alt={img.name} />
        </DialogContent>
      </Dialog>
    </>
  );
}

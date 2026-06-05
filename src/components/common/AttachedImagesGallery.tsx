import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { Button } from "@/components/common/Button";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/db";
import type { StoredImage } from "@/lib/types";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { ImageCard } from "@/components/common/ImageCard";
import { ImageZoomDialogContent } from "@/components/common/ImageZoomDialogContent";

export function AttachedImagesGallery({
  imageIds,
  title = "Images",
  collapsible = false,
  compact = false,
}: {
  imageIds: string[];
  title?: string;
  collapsible?: boolean;
  /**
   * Compact mode — smaller thumbnails, lighter hover styling, tighter spacing.
   * Use inside sidebar panels (e.g. GraphRightPanel). Default mode is for full
   * note detail views.
   */
  compact?: boolean;
}) {
  const rawImages = useLiveQuery(() => db.images.toArray());
  const images: StoredImage[] = useMemo(() => rawImages ?? [], [rawImages]);
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const imageById = useMemo(() => new Map(images.map((img) => [img.id, img])), [images]);
  const availableImageIds = useMemo(
    () => imageIds.filter((id) => imageById.has(id)),
    [imageIds, imageById],
  );
  const collapseButtonSize = compact ? "icon-h2" : "icon";

  if (availableImageIds.length === 0) return null;

  const getImageLabel = (id: string) => {
    const img = imageById.get(id);
    if (!img) return "Image";
    return img.caption?.trim() || img.name;
  };

  const wrapperVariant = "note-details-images";
  const zoomedImageIndex = zoomedImageId ? availableImageIds.indexOf(zoomedImageId) : -1;
  const hasZoomedImage = zoomedImageIndex >= 0;
  const hasMultipleImages = availableImageIds.length > 1;

  function showPreviousImage() {
    if (!hasZoomedImage) return;
    const nextIndex = (zoomedImageIndex - 1 + availableImageIds.length) % availableImageIds.length;
    setZoomedImageId(availableImageIds[nextIndex]);
  }

  function showNextImage() {
    if (!hasZoomedImage) return;
    const nextIndex = (zoomedImageIndex + 1) % availableImageIds.length;
    setZoomedImageId(availableImageIds[nextIndex]);
  }

  let zoomedTitle = "Image preview";
  if (hasZoomedImage) {
    zoomedTitle = getImageLabel(imageIds[zoomedImageIndex]);
  }

  let zoomedCounterText = "";
  if (hasZoomedImage) {
    zoomedCounterText = `${zoomedImageIndex + 1} / ${availableImageIds.length}`;
  }

  let headerSuffix = "";
  if (hasZoomedImage && hasMultipleImages) {
    headerSuffix = ` (${zoomedCounterText})`;
  }

  return (
    <Stack as="section" variant={wrapperVariant} gap="0">
      <Stack variant="note-details-images-header" gap="0">
        <Inline gap="2">
          <Stack variant="note-details-images-label" gap="0">
            {title} ({availableImageIds.length})
          </Stack>
          {collapsible && (
            <Button
              variant="outline"
              size={collapseButtonSize}
              aria-label={collapsed ? "Expand images" : "Collapse images"}
              title={collapsed ? "Expand images" : "Collapse images"}
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed && <ChevronDown />}
              {!collapsed && <ChevronUp />}
            </Button>
          )}
        </Inline>
      </Stack>

      {!collapsed && (
        <Stack variant="image-card-strip" gap="0">
          {availableImageIds.map((id) => (
            <ImageCard
              key={id}
              id={id}
              label={getImageLabel(id)}
              size="sm"
              onClick={() => setZoomedImageId(id)}
            />
          ))}
        </Stack>
      )}

      <Dialog
        open={!!zoomedImageId}
        onOpenChange={(open) => {
          if (!open) setZoomedImageId(null);
        }}
      >
        <DialogContent variant="expand">
          <DialogHeader>
            <DialogTitle>{`${zoomedTitle}${headerSuffix}`}</DialogTitle>
          </DialogHeader>
          {zoomedImageId && (
            <ImageZoomDialogContent
              key={zoomedImageId}
              imageId={zoomedImageId}
              alt="Enlarged note image"
              onPreviousImage={hasMultipleImages ? showPreviousImage : undefined}
              onNextImage={hasMultipleImages ? showNextImage : undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

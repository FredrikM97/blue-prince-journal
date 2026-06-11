import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { Button } from "@/components/common/Button";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/db";
import type { StoredImage } from "@/lib/types";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { ImageCard } from "@/components/common/ImageCard";
import { ImageZoomDialogContent } from "@/components/images/ImageZoomDialogContent";

function useImageZoom(availableImageIds: string[]) {
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);

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

  return {
    zoomedImageId,
    setZoomedImageId,
    zoomedImageIndex,
    hasZoomedImage,
    hasMultipleImages,
    showPreviousImage,
    showNextImage,
  };
}

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
  const [collapsed, setCollapsed] = useState(false);
  const imageById = useMemo(() => new Map(images.map((img) => [img.id, img])), [images]);
  const availableImageIds = useMemo(
    () => imageIds.filter((id) => imageById.has(id)),
    [imageIds, imageById],
  );
  const zoom = useImageZoom(availableImageIds);
  const collapseButtonSize = compact ? "icon-h2" : "icon";

  if (availableImageIds.length === 0) return null;

  const getImageLabel = (id: string) => {
    const img = imageById.get(id);
    if (!img) return "Image";
    return img.caption?.trim() || img.name;
  };

  const zoomedTitle = zoom.hasZoomedImage
    ? getImageLabel(availableImageIds[zoom.zoomedImageIndex])
    : "Image preview";

  const zoomedCounterText = zoom.hasZoomedImage
    ? `${zoom.zoomedImageIndex + 1} / ${availableImageIds.length}`
    : "";

  const headerSuffix = zoom.hasZoomedImage && zoom.hasMultipleImages ? ` (${zoomedCounterText})` : "";

  return (
    <Stack as="section" gap="0" className="space-y-2">
      <Stack gap="0" className="mb-2">
        <Inline gap="2">
          <Stack
            gap="0"
            className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
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
        <Stack gap="0" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {availableImageIds.map((id) => (
            <ImageCard
              key={id}
              id={id}
              label={getImageLabel(id)}
              size="sm"
              onClick={() => zoom.setZoomedImageId(id)}
            />
          ))}
        </Stack>
      )}

      <Dialog
        open={!!zoom.zoomedImageId}
        onOpenChange={(open) => {
          if (!open) zoom.setZoomedImageId(null);
        }}
      >
        <DialogContent variant="expand">
          <DialogHeader>
            <DialogTitle>{`${zoomedTitle}${headerSuffix}`}</DialogTitle>
          </DialogHeader>
          {zoom.zoomedImageId && (
            <ImageZoomDialogContent
              key={zoom.zoomedImageId}
              imageId={zoom.zoomedImageId}
              alt="Enlarged note image"
              onPreviousImage={zoom.hasMultipleImages ? zoom.showPreviousImage : undefined}
              onNextImage={zoom.hasMultipleImages ? zoom.showNextImage : undefined}
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

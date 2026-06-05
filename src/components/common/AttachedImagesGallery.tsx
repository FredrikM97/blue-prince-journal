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

  if (imageIds.length === 0) return null;

  const getImageLabel = (id: string) => {
    const img = imageById.get(id);
    if (!img) return "Image";
    return img.caption?.trim() || img.name;
  };

  const wrapperVariant = compact ? "note-details-images-compact" : "note-details-images";

  return (
    <Stack as="section" variant={wrapperVariant} gap="0">
      <Stack variant="note-details-images-header" gap="0">
        <Inline gap="2">
          <Stack variant="note-details-images-label" gap="0">
            {title} ({imageIds.length})
          </Stack>
          {collapsible && (
            <Button
              variant="ghost"
              size="icon"
              aria-label={collapsed ? "Expand images" : "Collapse images"}
              title={collapsed ? "Expand images" : "Collapse images"}
              className="h-6 w-6 rounded border border-input"
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
          {imageIds.map((id) => (
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
            <DialogTitle>
              {zoomedImageId ? getImageLabel(zoomedImageId) : "Image preview"}
            </DialogTitle>
          </DialogHeader>
          {zoomedImageId && (
            <ImageZoomDialogContent
              key={zoomedImageId}
              imageId={zoomedImageId}
              alt="Enlarged note image"
            />
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

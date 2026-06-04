import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { Button } from "@/components/common/Button";
import { StoredImageView } from "@/components/common/StoredImageView";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/db";
import type { StoredImage } from "@/lib/types";
import { MetaText } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";

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
  const images: StoredImage[] = useLiveQuery(() => db.images.toArray()) ?? [];
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const imageById = useMemo(() => new Map(images.map((img) => [img.id, img])), [images]);

  if (imageIds.length === 0) return null;

  const getImageLabel = (id: string) => {
    const img = imageById.get(id);
    if (!img) return "Image";
    return img.caption?.trim() || img.name;
  };

  const btnClass = compact
    ? "note-details-image-btn-compact text-left"
    : "note-details-image-btn text-left";
  const thumbClass = compact ? "h-20 w-full rounded object-cover" : "h-28 w-full object-cover";
  let wrapperVariant: "note-details-images" | "note-details-images-compact" = "note-details-images";
  if (compact) wrapperVariant = "note-details-images-compact";
  let gridVariant: "note-details-images-grid" | "note-details-images-grid-compact" =
    "note-details-images-grid";
  if (compact) gridVariant = "note-details-images-grid-compact";

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
        <Stack variant={gridVariant} gap="0">
          {imageIds.map((id) => (
            <Button
              key={id}
              type="button"
              variant="ghost"
              size="default"
              className={btnClass}
              onClick={() => setZoomedImageId(id)}
              aria-label={`Open image preview: ${getImageLabel(id)}`}
            >
              <StoredImageView
                id={id}
                className={thumbClass}
                alt={getImageLabel(id)}
                mode="thumb"
              />
              <Stack variant="note-details-image-caption-wrap" gap="0">
                <MetaText truncate>{getImageLabel(id)}</MetaText>
              </Stack>
            </Button>
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
          <Stack variant="note-details-zoom-preview" gap="0">
            {zoomedImageId && (
              <StoredImageView
                id={zoomedImageId}
                className="mx-auto max-h-[70vh] w-full object-contain"
                alt="Enlarged note image"
              />
            )}
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { Button, IconButton } from "@/components/common/Button";
import { StoredImageView } from "@/components/StoredImageView";
import { useStore } from "@/data/store";
import { MetaText } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";

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
  const images = useStore((s) => s.images);
  const [zoomedImageId, setZoomedImageId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const imageById = useMemo(() => new Map(images.map((img) => [img.id, img])), [images]);

  if (imageIds.length === 0) return null;

  const getImageLabel = (id: string) => {
    const img = imageById.get(id);
    if (!img) return "Image";
    return img.caption?.trim() || img.name;
  };

  const wrapperClass = compact ? "note-details-images-compact" : "note-details-images";
  const gridClass = compact ? "note-details-images-grid-compact" : "note-details-images-grid";
  const btnClass = compact
    ? "note-details-image-btn-compact text-left"
    : "note-details-image-btn text-left";
  const thumbClass = compact ? "h-20 w-full rounded object-cover" : "h-28 w-full object-cover";

  return (
    <section className={wrapperClass}>
      <div className="mb-2">
        <Inline gap="2">
          <div className="note-details-images-label">
            {title} ({imageIds.length})
          </div>
          {collapsible && (
            <IconButton
              aria-label={collapsed ? "Expand images" : "Collapse images"}
              title={collapsed ? "Expand images" : "Collapse images"}
              className="h-6 w-6 rounded border border-input"
              onClick={() => setCollapsed((v) => !v)}
            >
              {collapsed && <ChevronDown />}
              {!collapsed && <ChevronUp />}
            </IconButton>
          )}
        </Inline>
      </div>

      {!collapsed && (
        <div className={gridClass}>
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
              <StoredImageView id={id} className={thumbClass} alt={getImageLabel(id)} />
              <div className="mt-1 px-1">
                <MetaText truncate>{getImageLabel(id)}</MetaText>
              </div>
            </Button>
          ))}
        </div>
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
          <div className="note-details-zoom-preview">
            {zoomedImageId && (
              <StoredImageView
                id={zoomedImageId}
                className="mx-auto max-h-[70vh] w-full object-contain"
                alt="Enlarged note image"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

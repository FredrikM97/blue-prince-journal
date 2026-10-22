/**
 * PendingImageList — row of thumbnail previews for images selected but not yet saved.
 * Each thumbnail shows a remove button. Object URLs are revoked on unmount.
 */

import { X } from "lucide-react";
import { memo, useEffect, useMemo } from "react";
import { Button } from "@/components/common/Button";

export type PendingImage = {
  id: string;
  blob: Blob;
};

const PendingImageItem = memo(function PendingImageItem({
  blob,
  id,
  onRemove,
}: {
  blob: Blob;
  id: string;
  onRemove: (id: string) => void;
}) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob]);

  useEffect(() => {
    return () => URL.revokeObjectURL(url);
  }, [url]);

  return (
    <div className="relative h-14 w-14 overflow-hidden rounded border border-border">
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
      <Button
        onClick={() => onRemove(id)}
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 rounded-bl bg-black/60 p-0.5 text-white"
        aria-label="Remove"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
});

/**
 * Renders removable previews for images selected but not yet persisted.
 */
export function PendingImageList({
  images,
  onRemove,
}: {
  images: PendingImage[];
  onRemove: (id: string) => void;
}) {
  if (images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {images.map(({ blob, id }) => (
        <PendingImageItem key={id} blob={blob} id={id} onRemove={onRemove} />
      ))}
    </div>
  );
}

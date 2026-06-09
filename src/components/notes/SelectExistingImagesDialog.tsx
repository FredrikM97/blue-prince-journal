import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Dialog, DialogContent, DialogTitle } from "@/components/common/Dialog";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { ImageCard } from "@/components/common/ImageCard";
import { Grid, Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { MetaText } from "@/components/common/Typography";
import { getImageLabel } from "@/lib/imageLabel";

type ImageSort = "newest" | "oldest" | "name-asc" | "name-desc";

const IMAGE_SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
];

type SelectableImage = {
  id: string;
  name: string;
  caption?: string;
  createdAt: number;
};

export function SelectExistingImagesDialog({
  open,
  onOpenChange,
  images,
  selectedImageIds,
  onToggleImageId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: SelectableImage[];
  selectedImageIds: string[];
  onToggleImageId: (id: string, currentlySelected: boolean) => void;
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
              onValueChange={(value) => {
                setImageSort(value as ImageSort);
                setPage(0);
              }}
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

        <Stack className="dialog-scroll-body-tall" gap="0">
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
                      onToggleImageId(img.id, selected);
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

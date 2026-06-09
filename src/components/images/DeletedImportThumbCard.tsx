import { useEffect, useRef, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";
import { Stack } from "@/components/common/general/Stack";
import { Text } from "@/components/common/Typography";

export function DeletedImportThumbCard({
  sourceKey,
  fileName,
  deletedAt,
  busy,
  onUndelete,
  onHardDelete,
  loadPreview,
}: {
  sourceKey: string;
  fileName: string;
  deletedAt: number;
  busy: boolean;
  onUndelete: (sourceKey: string, fileName: string) => void;
  onHardDelete: (sourceKey: string, fileName: string) => void;
  loadPreview: (sourceKey: string) => Promise<Blob | null>;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        async function load() {
          const blob = await loadPreview(sourceKey);
          if (!active || !blob) return;
          objectUrl = URL.createObjectURL(blob);
          setPreviewUrl(objectUrl);
        }
        void load();
      },
      { rootMargin: "120px" },
    );

    const el = buttonRef.current;
    if (el) observer.observe(el);

    return () => {
      active = false;
      observer.disconnect();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [loadPreview, sourceKey]);

  return (
    <Stack gap="1.5" className="deleted-import-thumb">
      <Stack as="div" gap="0" className="deleted-import-thumb-stage">
        <Button
          ref={buttonRef}
          variant="ghost"
          size="content"
          className="bg-transparent hover:bg-transparent hover:opacity-75"
          aria-label={`Open deleted import preview for ${fileName}`}
          onClick={() => setPreviewOpen(true)}
        >
          {previewUrl ? (
            <img src={previewUrl} alt={fileName} className="deleted-import-thumb-image" />
          ) : (
            <Stack as="div" gap="0" className="deleted-import-thumb-fallback">
              <Text as="div" size="xs" tone="muted">
                Preview unavailable
              </Text>
            </Stack>
          )}
        </Button>
        <Stack as="div" gap="0" className="deleted-import-thumb-action">
          <Inline gap="1">
            <Button
              variant="outline-destructive"
              size="icon-h2"
              disabled={busy}
              aria-label="Permanently delete image import"
              title="Permanently delete"
              onClick={() => onHardDelete(sourceKey, fileName)}
            >
              <Trash2 className="icon-sm" />
            </Button>
            <Button
              variant="ghost"
              size="icon-h2"
              disabled={busy}
              aria-label="Undelete image import"
              title="Undelete"
              onClick={() => onUndelete(sourceKey, fileName)}
            >
              <RotateCcw className="icon-sm" />
            </Button>
          </Inline>
        </Stack>
        <Stack as="div" gap="0" className="deleted-import-thumb-overlay">
          <Text as="div" size="xs" tone="default" variant="default" truncate>
            {fileName}
          </Text>
          <Text as="div" size="xs" tone="muted" truncate>
            Deleted {new Date(deletedAt).toLocaleDateString()}
          </Text>
        </Stack>
      </Stack>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent variant="expand">
          <DialogHeader>
            <DialogTitle>{fileName}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <Stack as="div" gap="0" className="images-zoom-preview">
              <img src={previewUrl} alt={fileName} className="images-zoom-preview-image" />
            </Stack>
          )}
          {!previewUrl && (
            <Stack as="div" gap="0" className="deleted-import-thumb-fallback">
              <Text as="div" size="sm" tone="muted">
                Preview unavailable
              </Text>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
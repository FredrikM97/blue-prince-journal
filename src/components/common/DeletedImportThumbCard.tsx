import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/Stack";
import { Text } from "@/components/common/Typography";

export function DeletedImportThumbCard({
  sourceKey,
  fileName,
  deletedAt,
  busy,
  onUndelete,
  loadPreview,
}: {
  sourceKey: string;
  fileName: string;
  deletedAt: number;
  busy: boolean;
  onUndelete: (sourceKey: string, fileName: string) => void;
  loadPreview: (sourceKey: string) => Promise<Blob | null>;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;

    async function load() {
      const blob = await loadPreview(sourceKey);
      if (!active || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
    }

    void load();

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [loadPreview, sourceKey]);

  return (
    <Stack gap="1.5" variant="deleted-import-thumb">
      <Stack as="div" gap="0" variant="deleted-import-thumb-stage">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={fileName}
            style={{ height: "100%", width: "100%", objectFit: "cover" }}
          />
        ) : (
          <Stack as="div" gap="0" variant="deleted-import-thumb-fallback">
            <Text as="div" size="xs" tone="muted">
              Preview unavailable
            </Text>
          </Stack>
        )}
        <Stack as="div" gap="0" variant="deleted-import-thumb-action">
          <Button
            variant="ghost"
            size="icon"
            disabled={busy}
            aria-label="Undelete image import"
            title="Undelete"
            onClick={() => onUndelete(sourceKey, fileName)}
          >
            <RotateCcw className="icon-sm" />
          </Button>
        </Stack>
        <Stack as="div" gap="0" variant="deleted-import-thumb-overlay">
          <Text as="div" size="xs" tone="default" variant="default" truncate>
            {fileName}
          </Text>
        </Stack>
      </Stack>
      <Stack gap="0">
        <Text as="div" size="sm" truncate>
          {fileName}
        </Text>
        <Text as="div" size="xs" tone="muted" truncate>
          Deleted {new Date(deletedAt).toLocaleDateString()}
        </Text>
      </Stack>
    </Stack>
  );
}

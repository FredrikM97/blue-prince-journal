import { useEffect, useState } from "react";
import { db } from "@/data/db";
import {
  cacheFullUrl,
  cacheThumbUrl,
  createThumbUrl,
  getCachedFullUrl,
  getCachedThumbUrl,
} from "@/data/images/storedImageThumbs";

export function useStoredImageUrl({
  id,
  mode,
  lazy,
  blob,
}: {
  id: string;
  mode: "full" | "thumb";
  lazy: boolean;
  blob?: Blob;
}) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    if (lazy) return;

    let active = true;
    async function loadFromBlob(imageBlob: Blob) {
      if (mode === "thumb") {
        const cachedUrl = getCachedThumbUrl(id, imageBlob);
        if (cachedUrl) {
          setUrl(cachedUrl);
          return;
        }

        try {
          const thumbUrl = await createThumbUrl(imageBlob);
          if (!active) {
            URL.revokeObjectURL(thumbUrl);
            return;
          }
          cacheThumbUrl(id, imageBlob, thumbUrl);
          setUrl(thumbUrl);
          return;
        } catch {
          const fallbackUrl = URL.createObjectURL(imageBlob);
          if (!active) {
            URL.revokeObjectURL(fallbackUrl);
            return;
          }
          cacheThumbUrl(id, imageBlob, fallbackUrl);
          setUrl(fallbackUrl);
          return;
        }
      }

      const cachedFullUrl = getCachedFullUrl(id, imageBlob);
      if (cachedFullUrl) {
        setUrl(cachedFullUrl);
        return;
      }

      const fullUrl = URL.createObjectURL(imageBlob);
      if (!active) {
        URL.revokeObjectURL(fullUrl);
        return;
      }
      cacheFullUrl(id, imageBlob, fullUrl);
      setUrl(fullUrl);
    }

    const loader = blob ? Promise.resolve({ blob }) : db.images.get(id);

    loader
      .then(async (img) => {
        if (!active || !img) return;

        await loadFromBlob(img.blob);
      })
      .catch(() => {
        // Keep placeholder if the image cannot be read.
      });

    return () => {
      active = false;
    };
  }, [id, mode, lazy, blob]);

  return url;
}

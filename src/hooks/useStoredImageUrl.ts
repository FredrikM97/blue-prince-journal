import { useEffect, useState } from "react";
import { db } from "@/data/db";
import { cacheThumbUrl, createThumbUrl, getCachedThumbUrl } from "@/data/images/storedImageThumbs";

export function useStoredImageUrl({
  id,
  mode,
  lazy,
}: {
  id: string;
  mode: "full" | "thumb";
  lazy: boolean;
}) {
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    if (lazy) return;

    let active = true;
    let uncachedUrl: string | undefined;

    db.images
      .get(id)
      .then(async (img) => {
        if (!active || !img) return;

        if (mode === "thumb") {
          const cachedUrl = getCachedThumbUrl(id, img.blob);
          if (cachedUrl) {
            setUrl(cachedUrl);
            return;
          }

          try {
            const thumbUrl = await createThumbUrl(img.blob);
            if (!active) {
              URL.revokeObjectURL(thumbUrl);
              return;
            }
            cacheThumbUrl(id, img.blob, thumbUrl);
            setUrl(thumbUrl);
            return;
          } catch {
            const fallbackUrl = URL.createObjectURL(img.blob);
            if (!active) {
              URL.revokeObjectURL(fallbackUrl);
              return;
            }
            cacheThumbUrl(id, img.blob, fallbackUrl);
            setUrl(fallbackUrl);
            return;
          }
        }

        uncachedUrl = URL.createObjectURL(img.blob);
        setUrl(uncachedUrl);
      })
      .catch(() => {
        // Keep placeholder if the image cannot be read.
      });

    return () => {
      active = false;
      if (uncachedUrl) URL.revokeObjectURL(uncachedUrl);
    };
  }, [id, mode, lazy]);

  return url;
}

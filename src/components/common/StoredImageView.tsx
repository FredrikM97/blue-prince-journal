import { useEffect, useState } from "react";
import { db } from "@/data/db";

const THUMB_MAX_EDGE = 320;
const THUMB_CACHE_MAX = 250;

type ThumbCacheEntry = {
  key: string;
  url: string;
};

const thumbCache = new Map<string, ThumbCacheEntry>();

function getBlobCacheKey(blob: Blob): string {
  return `${blob.size}:${blob.type}`;
}

function getCachedThumbUrl(id: string, blob: Blob): string | null {
  const key = getBlobCacheKey(blob);
  const cached = thumbCache.get(id);
  if (!cached) return null;
  if (cached.key !== key) {
    URL.revokeObjectURL(cached.url);
    thumbCache.delete(id);
    return null;
  }
  // Refresh insertion order so recently used entries are evicted last.
  thumbCache.delete(id);
  thumbCache.set(id, cached);
  return cached.url;
}

function cacheThumbUrl(id: string, blob: Blob, url: string): void {
  const previous = thumbCache.get(id);
  if (previous) {
    URL.revokeObjectURL(previous.url);
    thumbCache.delete(id);
  }

  thumbCache.set(id, { key: getBlobCacheKey(blob), url });
  while (thumbCache.size > THUMB_CACHE_MAX) {
    const oldestKey = thumbCache.keys().next().value;
    if (!oldestKey) break;
    const oldest = thumbCache.get(oldestKey);
    if (oldest) URL.revokeObjectURL(oldest.url);
    thumbCache.delete(oldestKey);
  }
}

async function createThumbUrl(blob: Blob): Promise<string> {
  if (typeof createImageBitmap !== "function") {
    return URL.createObjectURL(blob);
  }

  const bitmap = await createImageBitmap(blob);
  try {
    const maxEdge = Math.max(bitmap.width, bitmap.height);
    if (maxEdge <= THUMB_MAX_EDGE) {
      return URL.createObjectURL(blob);
    }

    const scale = THUMB_MAX_EDGE / maxEdge;
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return URL.createObjectURL(blob);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);

    const thumbBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) {
          resolve(result);
          return;
        }
        reject(new Error("Failed to create image thumbnail"));
      }, blob.type || "image/png");
    });
    return URL.createObjectURL(thumbBlob);
  } finally {
    bitmap.close();
  }
}

export function StoredImageView({
  id,
  className,
  alt,
  mode = "full",
}: {
  id: string;
  className?: string;
  alt?: string;
  mode?: "full" | "thumb";
}) {
  const [url, setUrl] = useState<string | undefined>();
  useEffect(() => {
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
  }, [id, mode]);

  let loading: "lazy" | "eager" | undefined;
  if (mode === "thumb") loading = "lazy";
  if (!url) return <div className={`bg-muted ${className ?? ""}`} />;
  return <img src={url} alt={alt ?? ""} className={className} loading={loading} decoding="async" />;
}
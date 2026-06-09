const THUMB_MAX_EDGE = 320;
const THUMB_CACHE_MAX = 250;
const THUMB_CONCURRENCY = 6;

type ThumbCacheEntry = {
  key: string;
  url: string;
};

const thumbCache = new Map<string, ThumbCacheEntry>();
let thumbRunning = 0;
const thumbQueue: Array<() => void> = [];

function runThumbTask<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    function attempt() {
      if (thumbRunning >= THUMB_CONCURRENCY) {
        thumbQueue.push(attempt);
        return;
      }
      thumbRunning += 1;
      fn()
        .then(resolve, reject)
        .finally(() => {
          thumbRunning -= 1;
          const next = thumbQueue.shift();
          if (next) next();
        });
    }
    attempt();
  });
}

function getBlobCacheKey(blob: Blob): string {
  return `${blob.size}:${blob.type}`;
}

export function getCachedThumbUrl(id: string, blob: Blob): string | null {
  const key = getBlobCacheKey(blob);
  const cached = thumbCache.get(id);
  if (!cached) return null;
  if (cached.key !== key) {
    URL.revokeObjectURL(cached.url);
    thumbCache.delete(id);
    return null;
  }

  thumbCache.delete(id);
  thumbCache.set(id, cached);
  return cached.url;
}

export function cacheThumbUrl(id: string, blob: Blob, url: string): void {
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

export async function createThumbUrl(blob: Blob): Promise<string> {
  return runThumbTask(async () => {
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
  });
}

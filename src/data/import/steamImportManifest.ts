import { getMeta, setMeta } from "../db";

const STEAM_IMPORT_MANIFEST_META_KEY = "steam-import-manifest";

export interface SteamDeletedImportEntry {
  sourceKey: string;
  fileName: string;
  deletedAt: number;
}

export interface SteamImportSourceEntry {
  sourceKey: string;
  fileName: string;
}

export interface SteamImportManifest {
  version: 1;
  sourceByImageId: Record<string, SteamImportSourceEntry>;
  deleted: SteamDeletedImportEntry[];
}

let manifestCache: SteamImportManifest | null = null;

function normalizeSteamSourceKey(path: string): string {
  return path.trim().toLowerCase();
}

function getPathFileName(path: string): string {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];
  if (!fileName) return path;
  return fileName;
}

function normalizeManifest(raw: unknown): SteamImportManifest {
  const fallback: SteamImportManifest = {
    version: 1,
    sourceByImageId: {},
    deleted: [],
  };

  if (!raw || typeof raw !== "object") return fallback;

  const candidate = raw as Partial<SteamImportManifest>;
  const sourceByImageId: Record<string, SteamImportSourceEntry> = {};
  if (candidate.sourceByImageId && typeof candidate.sourceByImageId === "object") {
    for (const [imageId, value] of Object.entries(candidate.sourceByImageId)) {
      if (!value || typeof value !== "object") continue;
      const sourceValue = value as Partial<SteamImportSourceEntry>;
      if (typeof sourceValue.sourceKey !== "string") continue;
      const normalizedSourceKey = normalizeSteamSourceKey(sourceValue.sourceKey);
      const fileName =
        typeof sourceValue.fileName === "string" && sourceValue.fileName.trim().length > 0
          ? sourceValue.fileName
          : getPathFileName(sourceValue.sourceKey);
      sourceByImageId[imageId] = { sourceKey: normalizedSourceKey, fileName };
    }
  }

  const deleted: SteamDeletedImportEntry[] = [];
  if (Array.isArray(candidate.deleted)) {
    for (const entry of candidate.deleted) {
      if (!entry || typeof entry !== "object") continue;
      const deletedEntry = entry as Partial<SteamDeletedImportEntry>;
      if (typeof deletedEntry.sourceKey !== "string") continue;
      const normalizedSourceKey = normalizeSteamSourceKey(deletedEntry.sourceKey);
      const fileName =
        typeof deletedEntry.fileName === "string" && deletedEntry.fileName.trim().length > 0
          ? deletedEntry.fileName
          : getPathFileName(deletedEntry.sourceKey);
      deleted.push({
        sourceKey: normalizedSourceKey,
        fileName,
        deletedAt:
          typeof deletedEntry.deletedAt === "number" && Number.isFinite(deletedEntry.deletedAt)
            ? deletedEntry.deletedAt
            : Date.now(),
      });
    }
  }

  return {
    version: 1,
    sourceByImageId,
    deleted,
  };
}

export async function loadSteamImportManifest(): Promise<SteamImportManifest> {
  if (manifestCache) return manifestCache;
  const raw = await getMeta<unknown>(STEAM_IMPORT_MANIFEST_META_KEY);
  manifestCache = normalizeManifest(raw);
  return manifestCache;
}

export async function saveSteamImportManifest(manifest: SteamImportManifest): Promise<void> {
  manifestCache = manifest;
  await setMeta(STEAM_IMPORT_MANIFEST_META_KEY, manifest);
}

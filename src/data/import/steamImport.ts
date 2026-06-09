import { db, deleteMeta, getMeta, setMeta } from "../db";
import type { StoredImage } from "@/lib/types";
import type { FsDirectoryHandle as SteamDirHandle, FsFileHandle as SteamFileHandle } from "../sync/fileAccessTypes";
import {
  loadSteamImportManifest,
  saveSteamImportManifest,
  type SteamDeletedImportEntry,
  type SteamImportManifest,
} from "./steamImportManifest";

export type { SteamDeletedImportEntry } from "./steamImportManifest";

type AddImageFn = (blob: Blob, name?: string, caption?: string) => Promise<StoredImage>;

const STEAM_IMPORT_LAST_STATUS_META_KEY = "steam-import-last-status";
const STEAM_IMPORT_DIR_HANDLE_META_KEY = "steam-import-dir-handle";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".bmp"]);

export interface SteamImportStatus {
  lastRefreshAt: number | null;
  lastImported: number;
  lastSkipped: number;
}

interface SteamImportRuntimeState {
  existingImageNames: Set<string>;
  importedSourceKeys: Set<string>;
  deletedSourceKeys: Set<string>;
}

let activeSteamHandle: SteamDirHandle | null = null;

// ---------------------------------------------------------------------------
// Steam file-handle cache (per source key, cleared when handle changes)
// ---------------------------------------------------------------------------
const fileHandleCache = new Map<string, SteamFileHandle | null>();

function clearFileHandleCache(): void {
  fileHandleCache.clear();
}

async function findChildHandleByName(
  directory: SteamDirHandle,
  segmentName: string,
): Promise<FileSystemHandle | null> {
  if (!directory.values) return null;
  for await (const entry of directory.values()) {
    if (entry.name.toLowerCase() === segmentName.toLowerCase()) {
      return entry;
    }
  }
  return null;
}

async function getSourceFileFromActiveHandle(sourceKey: string): Promise<File | null> {
  if (!activeSteamHandle) return null;

  if (fileHandleCache.has(sourceKey)) {
    const cached = fileHandleCache.get(sourceKey);
    if (!cached) return null;
    return cached.getFile();
  }

  const segments = sourceKey
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);
  if (segments.length === 0) {
    fileHandleCache.set(sourceKey, null);
    return null;
  }

  let currentDirectory: SteamDirHandle = activeSteamHandle;
  for (let i = 0; i < segments.length; i += 1) {
    const child = await findChildHandleByName(currentDirectory, segments[i]);
    if (!child) {
      fileHandleCache.set(sourceKey, null);
      return null;
    }

    const isLast = i === segments.length - 1;
    if (isLast) {
      if (child.kind !== "file") {
        fileHandleCache.set(sourceKey, null);
        return null;
      }
      const fileHandle = child as unknown as SteamFileHandle;
      fileHandleCache.set(sourceKey, fileHandle);
      return fileHandle.getFile();
    }

    if (child.kind !== "directory") {
      fileHandleCache.set(sourceKey, null);
      return null;
    }
    currentDirectory = child as unknown as SteamDirHandle;
  }

  fileHandleCache.set(sourceKey, null);
  return null;
}

export function isSteamImportSupported(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

export function isSteamFolderSyncSupported(): boolean {
  if (typeof window === "undefined") return false;
  return typeof window.showDirectoryPicker === "function";
}

export function getActiveSteamFolderName(): string | null {
  return activeSteamHandle?.name ?? null;
}

export async function loadSteamImportSourceBlob(sourceKey: string): Promise<Blob | null> {
  const normalizedSourceKey = normalizeSteamSourceKey(sourceKey);
  const file = await getSourceFileFromActiveHandle(normalizedSourceKey);
  if (!file) return null;
  return file;
}

async function ensureReadPermission(handle: SteamDirHandle, request = true): Promise<boolean> {
  const current = await handle.queryPermission({ mode: "read" });
  if (current === "granted") return true;
  if (current === "denied") return false;
  if (!request) return false;
  const requested = await handle.requestPermission({ mode: "read" });
  return requested === "granted";
}

export async function restoreSteamImportFolder(): Promise<SteamDirHandle | null> {
  if (!isSteamFolderSyncSupported()) return null;
  try {
    const handle = await getMeta<SteamDirHandle>(STEAM_IMPORT_DIR_HANDLE_META_KEY);
    if (!handle) return null;
    const granted = await ensureReadPermission(handle, false);
    if (!granted) return null;
    activeSteamHandle = handle;
    return handle;
  } catch {
    return null;
  }
}

export async function connectSteamImportFolder(): Promise<SteamDirHandle | null> {
  if (!isSteamFolderSyncSupported()) return null;
  try {
    const handle = await window.showDirectoryPicker({ mode: "read" });
    const granted = await ensureReadPermission(handle);
    if (!granted) return null;
    await setMeta(STEAM_IMPORT_DIR_HANDLE_META_KEY, handle);
    activeSteamHandle = handle;
    clearFileHandleCache();
    return handle;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return null;
    }
    throw err;
  }
}

export async function disconnectSteamImportFolder(): Promise<void> {
  await deleteMeta(STEAM_IMPORT_DIR_HANDLE_META_KEY);
  activeSteamHandle = null;
  clearFileHandleCache();
}

async function collectImageFiles(
  handle: SteamDirHandle,
  prefix: string,
  files: Array<{ path: string; file: File }>,
): Promise<void> {
  if (!handle.values) return;
  for await (const entry of handle.values()) {
    const nextPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.kind === "directory") {
      if (entry.name.toLowerCase() === "thumbnails") continue;
      const directoryEntry = entry as unknown as SteamDirHandle;
      await collectImageFiles(directoryEntry, nextPath, files);
      continue;
    }

    if (entry.kind !== "file") {
      continue;
    }

    const fileHandle = entry as unknown as SteamFileHandle;
    const file = await fileHandle.getFile();
    const dot = file.name.lastIndexOf(".");
    const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
    if (!IMAGE_EXTENSIONS.has(ext)) continue;
    files.push({ path: nextPath, file });
  }
}

function normalizeImageName(name: string): string {
  return name.trim().toLowerCase();
}

function normalizeSteamSourceKey(path: string): string {
  return path.trim().toLowerCase();
}

function getPathFileName(path: string): string {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];
  if (!fileName) return path;
  return fileName;
}

async function pruneMissingImageMappings(manifest: SteamImportManifest): Promise<boolean> {
  const existingImageIds = new Set((await db.images.toArray()).map((image) => image.id));
  let changed = false;
  for (const imageId of Object.keys(manifest.sourceByImageId)) {
    if (existingImageIds.has(imageId)) continue;
    delete manifest.sourceByImageId[imageId];
    changed = true;
  }
  return changed;
}

export async function loadSteamDeletedImports(): Promise<SteamDeletedImportEntry[]> {
  const manifest = await loadSteamImportManifest();
  return [...manifest.deleted].sort((a, b) => b.deletedAt - a.deletedAt);
}

export async function restoreDeletedSteamImport(sourceKey: string): Promise<void> {
  const normalizedSourceKey = normalizeSteamSourceKey(sourceKey);
  const manifest = await loadSteamImportManifest();
  const nextDeleted = manifest.deleted.filter((entry) => entry.sourceKey !== normalizedSourceKey);
  if (nextDeleted.length === manifest.deleted.length) return;
  manifest.deleted = nextDeleted;
  await saveSteamImportManifest(manifest);
}

export async function restoreDeletedSteamImportImage(
  sourceKey: string,
  addImage: AddImageFn,
): Promise<StoredImage | null> {
  const normalizedSourceKey = normalizeSteamSourceKey(sourceKey);
  const blob = await loadSteamImportSourceBlob(sourceKey);
  if (!blob) {
    await restoreDeletedSteamImport(sourceKey);
    return null;
  }

  const fileName = getPathFileName(sourceKey) || "image";
  const created = await addImage(blob, fileName, fileName);
  const manifest = await loadSteamImportManifest();
  manifest.sourceByImageId[created.id] = { sourceKey: normalizedSourceKey, fileName };
  manifest.deleted = manifest.deleted.filter((entry) => entry.sourceKey !== normalizedSourceKey);
  await saveSteamImportManifest(manifest);
  return created;
}

export async function getSteamImportedImageIdsForSource(sourceKey: string): Promise<string[]> {
  const normalizedSourceKey = normalizeSteamSourceKey(sourceKey);
  const manifest = await loadSteamImportManifest();
  const matches: string[] = [];
  for (const [imageId, entry] of Object.entries(manifest.sourceByImageId)) {
    if (entry.sourceKey !== normalizedSourceKey) continue;
    matches.push(imageId);
  }
  return matches;
}

export async function permanentlyDeleteSteamImport(sourceKey: string): Promise<void> {
  const normalizedSourceKey = normalizeSteamSourceKey(sourceKey);
  const manifest = await loadSteamImportManifest();

  let changed = false;
  for (const [imageId, entry] of Object.entries(manifest.sourceByImageId)) {
    if (entry.sourceKey !== normalizedSourceKey) continue;
    delete manifest.sourceByImageId[imageId];
    changed = true;
  }

  const nextDeleted = manifest.deleted.filter((entry) => entry.sourceKey !== normalizedSourceKey);
  if (nextDeleted.length !== manifest.deleted.length) {
    manifest.deleted = nextDeleted;
    changed = true;
  }

  if (changed) {
    await saveSteamImportManifest(manifest);
  }
}

export async function markSteamImportedImageDeleted(
  imageId: string,
  fallbackFileName?: string,
): Promise<void> {
  const manifest = await loadSteamImportManifest();
  const sourceEntry = manifest.sourceByImageId[imageId];
  if (!sourceEntry) return;

  delete manifest.sourceByImageId[imageId];
  const alreadyDeleted = manifest.deleted.some(
    (entry) => entry.sourceKey === sourceEntry.sourceKey,
  );
  if (!alreadyDeleted) {
    const fileName =
      sourceEntry.fileName || fallbackFileName || getPathFileName(sourceEntry.sourceKey);
    manifest.deleted.push({
      sourceKey: sourceEntry.sourceKey,
      fileName,
      deletedAt: Date.now(),
    });
  }
  await saveSteamImportManifest(manifest);
}

async function buildImportRuntimeState(
  manifest: SteamImportManifest,
): Promise<{ state: SteamImportRuntimeState; manifestChanged: boolean }> {
  const images = await db.images.toArray();
  const existingImageNames = new Set(images.map((image) => normalizeImageName(image.name)));
  const manifestChanged = await pruneMissingImageMappings(manifest);
  const importedSourceKeys = new Set(
    Object.values(manifest.sourceByImageId).map((entry) => entry.sourceKey),
  );
  const deletedSourceKeys = new Set(manifest.deleted.map((entry) => entry.sourceKey));
  return {
    state: { existingImageNames, importedSourceKeys, deletedSourceKeys },
    manifestChanged,
  };
}

function shouldSkipImportFile({
  sourceKey,
  fileName,
  force,
  state,
}: {
  sourceKey: string;
  fileName: string;
  force: boolean;
  state: SteamImportRuntimeState;
}): boolean {
  if (state.deletedSourceKeys.has(sourceKey)) return true;
  if (!force && state.importedSourceKeys.has(sourceKey)) return true;
  const fileNameKey = normalizeImageName(fileName);
  if (!force && state.existingImageNames.has(fileNameKey)) return true;
  return false;
}

function recordImportedFile({
  manifest,
  state,
  imageId,
  sourceKey,
  fileName,
}: {
  manifest: SteamImportManifest;
  state: SteamImportRuntimeState;
  imageId: string;
  sourceKey: string;
  fileName: string;
}): void {
  state.importedSourceKeys.add(sourceKey);
  manifest.sourceByImageId[imageId] = { sourceKey, fileName };
  if (state.deletedSourceKeys.delete(sourceKey)) {
    manifest.deleted = manifest.deleted.filter((deleted) => deleted.sourceKey !== sourceKey);
  }
  state.existingImageNames.add(normalizeImageName(fileName));
}

export async function syncConnectedSteamFolder(
  addImage: AddImageFn,
  options?: { force?: boolean },
): Promise<{ imported: number; skipped: number } | null> {
  if (!activeSteamHandle) return null;

  const files: Array<{ path: string; file: File }> = [];
  await collectImageFiles(activeSteamHandle, "", files);

  const manifest = await loadSteamImportManifest();
  const runtime = await buildImportRuntimeState(manifest);
  const state = runtime.state;
  let manifestChanged = runtime.manifestChanged;
  const force = options?.force ?? false;

  let imported = 0;
  let skipped = 0;

  for (const entry of files) {
    const { file } = entry;
    const sourceKey = normalizeSteamSourceKey(entry.path);
    if (shouldSkipImportFile({ sourceKey, fileName: file.name, force, state })) {
      skipped += 1;
      continue;
    }

    const created = await addImage(file, file.name, file.name);
    recordImportedFile({
      manifest,
      state,
      imageId: created.id,
      sourceKey,
      fileName: file.name,
    });
    manifestChanged = true;
    imported += 1;
  }

  if (manifestChanged) {
    await saveSteamImportManifest(manifest);
  }

  const status: SteamImportStatus = {
    lastRefreshAt: Date.now(),
    lastImported: imported,
    lastSkipped: skipped,
  };
  await setMeta(STEAM_IMPORT_LAST_STATUS_META_KEY, status);
  return { imported, skipped };
}

export async function loadSteamImportStatus(): Promise<SteamImportStatus> {
  return (
    (await getMeta<SteamImportStatus>(STEAM_IMPORT_LAST_STATUS_META_KEY)) ?? {
      lastRefreshAt: null,
      lastImported: 0,
      lastSkipped: 0,
    }
  );
}

/**
 * Opens a native OS folder picker via a hidden <input webkitdirectory> element.
 * This approach works with system directories (e.g. Steam screenshot folders) that
 * the File System Access API (showDirectoryPicker) cannot access due to browser sandboxing.
 */
function pickFolder(): Promise<File[] | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.setAttribute("webkitdirectory", "");

    let settled = false;

    input.addEventListener("change", () => {
      settled = true;
      const files = Array.from(input.files ?? []).filter((f) => {
        const dot = f.name.lastIndexOf(".");
        const ext = dot >= 0 ? f.name.slice(dot).toLowerCase() : "";
        if (!IMAGE_EXTENSIONS.has(ext)) return false;
        // Skip Steam's thumbnails subdirectory
        const relPath: string =
          (f as File & { webkitRelativePath?: string }).webkitRelativePath ?? "";
        return !relPath
          .split("/")
          .slice(0, -1)
          .some((seg) => seg.toLowerCase() === "thumbnails");
      });
      resolve(files.length > 0 ? files : null);
    });

    // Detect cancel: window regains focus without a change event firing
    window.addEventListener(
      "focus",
      () => {
        setTimeout(() => {
          if (!settled) resolve(null);
        }, 500);
      },
      { once: true },
    );

    input.click();
  });
}

/**
 * Lets the user pick a folder, reads image files from it, deduplicates against
 * previous imports, and saves new ones via addImage.
 */
export async function pickAndImportSteamFiles(
  addImage: AddImageFn,
): Promise<{ imported: number; skipped: number } | null> {
  if (!isSteamImportSupported()) return null;

  const files = await pickFolder();
  if (files === null) return null;

  const manifest = await loadSteamImportManifest();
  const runtime = await buildImportRuntimeState(manifest);
  const state = runtime.state;
  let manifestChanged = runtime.manifestChanged;

  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const fileWithPath = file as File & { webkitRelativePath?: string };
    const sourcePath = fileWithPath.webkitRelativePath?.trim() || file.name;
    const sourceKey = normalizeSteamSourceKey(sourcePath);

    if (shouldSkipImportFile({ sourceKey, fileName: file.name, force: false, state })) {
      skipped += 1;
      continue;
    }

    const created = await addImage(file, file.name, file.name);
    recordImportedFile({
      manifest,
      state,
      imageId: created.id,
      sourceKey,
      fileName: file.name,
    });
    manifestChanged = true;
    imported += 1;
  }

  if (manifestChanged) {
    await saveSteamImportManifest(manifest);
  }

  const status: SteamImportStatus = {
    lastRefreshAt: Date.now(),
    lastImported: imported,
    lastSkipped: skipped,
  };
  await setMeta(STEAM_IMPORT_LAST_STATUS_META_KEY, status);
  return { imported, skipped };
}

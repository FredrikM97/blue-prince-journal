import { deleteMeta, getMeta, setMeta } from "./db";

type AddImageFn = (blob: Blob, name?: string, caption?: string) => Promise<unknown>;

const STEAM_IMPORT_SIGNATURES_META_KEY = "steam-import-signatures";
const STEAM_IMPORT_LAST_STATUS_META_KEY = "steam-import-last-status";
const STEAM_IMPORT_DIR_HANDLE_META_KEY = "steam-import-dir-handle";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".bmp"]);

export interface SteamImportStatus {
  lastRefreshAt: number | null;
  lastImported: number;
  lastSkipped: number;
}

interface SteamDirHandle {
  readonly name: string;
  values(): AsyncIterable<FileSystemHandle>;
  queryPermission(descriptor: { mode: "read" }): Promise<PermissionState>;
  requestPermission(descriptor: { mode: "read" }): Promise<PermissionState>;
}

interface SteamFileHandle {
  getFile(): Promise<File>;
}

declare global {
  interface Window {
    showDirectoryPicker(options?: { mode?: "read" }): Promise<SteamDirHandle>;
  }
}

let activeSteamHandle: SteamDirHandle | null = null;

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
}

async function collectImageFiles(
  handle: SteamDirHandle,
  prefix: string,
  files: Array<{ path: string; file: File }>,
): Promise<void> {
  for await (const entry of handle.values()) {
    const nextPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.kind === "directory") {
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

export async function syncConnectedSteamFolder(
  addImage: AddImageFn,
): Promise<{ imported: number; skipped: number } | null> {
  if (!activeSteamHandle) return null;

  const files: Array<{ path: string; file: File }> = [];
  await collectImageFiles(activeSteamHandle, "", files);

  const previous = (await getMeta<string[]>(STEAM_IMPORT_SIGNATURES_META_KEY)) ?? [];
  const signatures = new Set(previous);
  let imported = 0;
  let skipped = 0;

  for (const entry of files) {
    const { file, path } = entry;
    const signature = `${path}|${file.size}|${file.lastModified}`;
    if (signatures.has(signature)) {
      skipped += 1;
      continue;
    }
    await addImage(file, file.name, file.name);
    signatures.add(signature);
    imported += 1;
  }

  await setMeta(STEAM_IMPORT_SIGNATURES_META_KEY, Array.from(signatures));
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
        return IMAGE_EXTENSIONS.has(ext);
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

  const previous = (await getMeta<string[]>(STEAM_IMPORT_SIGNATURES_META_KEY)) ?? [];
  const signatures = new Set(previous);
  let imported = 0;
  let skipped = 0;

  for (const file of files) {
    const signature = `${file.name}|${file.size}|${file.lastModified}`;
    if (signatures.has(signature)) {
      skipped += 1;
      continue;
    }
    await addImage(file, file.name, file.name);
    signatures.add(signature);
    imported += 1;
  }

  await setMeta(STEAM_IMPORT_SIGNATURES_META_KEY, Array.from(signatures));
  const status: SteamImportStatus = {
    lastRefreshAt: Date.now(),
    lastImported: imported,
    lastSkipped: skipped,
  };
  await setMeta(STEAM_IMPORT_LAST_STATUS_META_KEY, status);
  return { imported, skipped };
}

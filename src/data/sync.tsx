/**
 * File System Access API sync utilities.
 *
 * Writes a sync snapshot folder to a user-chosen local directory after every
 * mutation. Data is stored in `manifest.json` and image blobs in `images/`.
 * If the directory is inside Dropbox / OneDrive / iCloud Drive, the OS cloud
 * client syncs it automatically — zero extra infrastructure.
 */
import {
  clearAllData,
  getMeta,
  setMeta,
  deleteMeta,
  listNotes,
  listTodos,
  listImages,
  listRoomStates,
  listSections,
  listGridCells,
  putNote,
  putTodo,
  putImage,
  putRoomState,
  putSection,
  putGridCell,
} from "./db";
import type { Note, Todo, StoredImage, RoomState, SectionDef, GridCell } from "@/lib/types";
import { listCustomRooms, replaceCustomRooms, type RoomCategory } from "./rooms";
import { buildUniqueFileName } from "./imageNames";

// ---------------------------------------------------------------------------
// Minimal local typings for File System Access API
// (TS lib.dom may not have the permission methods in all versions)
// ---------------------------------------------------------------------------

interface DirHandle {
  readonly name: string;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<DirHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandle>;
  queryPermission(descriptor: { mode: "read" | "readwrite" }): Promise<PermissionState>;
  requestPermission(descriptor: { mode: "read" | "readwrite" }): Promise<PermissionState>;
}

interface FileHandle {
  getFile(): Promise<File>;
  createWritable(): Promise<{
    write(data: string | BufferSource | Blob): Promise<void>;
    close(): Promise<void>;
  }>;
}

declare global {
  interface Window {
    showDirectoryPicker(options?: {
      mode?: "read" | "readwrite";
      startIn?: DirHandle;
    }): Promise<DirHandle>;
  }
}

// ---------------------------------------------------------------------------
// Data shape written to the sync manifest file
// ---------------------------------------------------------------------------

export interface SyncManifest {
  app: "blue-prince-notes";
  syncVersion: 1;
  syncedAt: number;
  notes: Note[];
  todos: Todo[];
  images?: Array<Omit<StoredImage, "blob"> & { fileName: string }>;
  rooms: RoomState[];
  sections: SectionDef[];
  gridCells: GridCell[];
  customRooms: Array<{ name: string; category: RoomCategory }>;
}

const SYNC_DIR_HANDLE_META_KEY = "sync-dir-handle";
const SYNC_MODE_META_KEY = "sync-mode";
const SYNC_MANIFEST_FILE_NAME = "manifest.json";
const SYNC_IMAGES_DIR_NAME = "images";
const SYNC_FOLDER_CONFLICT_PROMPT =
  "This folder already has data and this device also has data.\n\nPress OK to use folder data here (replace local data).\nPress Cancel to keep local data and overwrite the folder with it.";

export interface SyncFolderPayload {
  manifest: SyncManifest;
  images: StoredImage[];
}

export type SyncMode = "auto" | "manual";

export type SyncConnectResolution = "connected-empty" | "use-folder-data" | "keep-local-data";

export interface SyncConnectResult {
  handle: DirHandle;
  resolution: SyncConnectResolution;
  importedFolderData: boolean;
}

export interface SyncStatus {
  mode: SyncMode;
  dirty: boolean;
  lastDirtyAt: number | null;
  lastSyncedAt: number | null;
}

export interface LocalSyncItemSource {
  notes: ArrayLike<unknown>;
  todos: ArrayLike<unknown>;
  images: ArrayLike<unknown>;
  gridCells: ArrayLike<unknown>;
}

export function countLocalSyncItems(source: LocalSyncItemSource): number {
  return source.notes.length + source.todos.length + source.images.length + source.gridCells.length;
}

export function confirmSyncFolderConflict(confirmPrompt: (message: string) => boolean): boolean {
  return confirmPrompt(SYNC_FOLDER_CONFLICT_PROMPT);
}

// ---------------------------------------------------------------------------
// In-memory active handle (re-hydrated from IndexedDB on app start)
// ---------------------------------------------------------------------------

let _handle: DirHandle | null = null;
let _mode: SyncMode = "auto";
let _dirty = false;
let _lastDirtyAt: number | null = null;
let _lastSyncedAt: number | null = null;
const _statusListeners = new Set<(status: SyncStatus) => void>();

function getSyncSnapshot(): SyncStatus {
  return {
    mode: _mode,
    dirty: _dirty,
    lastDirtyAt: _lastDirtyAt,
    lastSyncedAt: _lastSyncedAt,
  };
}

function emitSyncStatus() {
  const snapshot = getSyncSnapshot();
  _statusListeners.forEach((listener) => listener(snapshot));
}

function markDirty() {
  if (!_dirty) {
    _dirty = true;
    _lastDirtyAt = Date.now();
  }
  emitSyncStatus();
}

export function getActiveSyncHandle(): DirHandle | null {
  return _handle;
}

export function getActiveSyncFolderName(): string | null {
  return _handle?.name ?? null;
}

export function getSyncStatus(): SyncStatus {
  return getSyncSnapshot();
}

export function subscribeSyncStatus(listener: (status: SyncStatus) => void) {
  _statusListeners.add(listener);
  listener(getSyncSnapshot());
  return () => {
    _statusListeners.delete(listener);
  };
}

async function ensureSyncPermission(handle: DirHandle, request = true): Promise<boolean> {
  const perm = await handle.queryPermission({ mode: "readwrite" });
  if (perm === "granted") return true;
  if (perm === "denied") return false;
  if (!request) return false;
  const requested = await handle.requestPermission({ mode: "readwrite" });
  return requested === "granted";
}

export async function loadSyncMode(): Promise<SyncMode> {
  try {
    const stored = await getMeta<SyncMode>(SYNC_MODE_META_KEY);
    _mode = stored === "manual" ? "manual" : "auto";
  } catch {
    _mode = "auto";
  }
  emitSyncStatus();
  return _mode;
}

export async function setSyncMode(mode: SyncMode): Promise<void> {
  _mode = mode;
  await setMeta(SYNC_MODE_META_KEY, mode);
  emitSyncStatus();
}

export async function openSyncFolderInPicker(): Promise<boolean> {
  if (!_handle) return false;
  try {
    await window.showDirectoryPicker({ mode: "readwrite", startIn: _handle });
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return false;
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

/** Load stored handle from IndexedDB and re-request permission. Returns the
 *  handle if permission was granted, null otherwise. */
export async function restoreSyncHandle(): Promise<DirHandle | null> {
  try {
    const handle = await getMeta<DirHandle>(SYNC_DIR_HANDLE_META_KEY);
    if (!handle) return null;
    const granted = await ensureSyncPermission(handle, false);
    if (!granted) return null;
    _handle = handle;
    return handle;
  } catch {
    return null;
  }
}

/** Let the user pick a folder, persist it, and make it the active handle. */
export async function pickSyncFolder(): Promise<DirHandle | null> {
  try {
    const handle = await window.showDirectoryPicker({ mode: "readwrite" });
    const granted = await ensureSyncPermission(handle, true);
    if (!granted) return null;
    await setMeta(SYNC_DIR_HANDLE_META_KEY, handle);
    _handle = handle;
    return handle;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return null;
    }
    throw err;
  }
}

export async function connectSyncFolderWithConflictResolution(
  localItemCount: number,
  confirmUseFolderData: () => boolean,
): Promise<SyncConnectResult | null> {
  const handle = await pickSyncFolder();
  if (!handle) return null;

  const existing = await readFromSyncFolder(handle);
  if (!existing) {
    await writeToSyncFolder(handle);
    return {
      handle,
      resolution: "connected-empty",
      importedFolderData: false,
    };
  }

  if (localItemCount === 0) {
    await importSyncManifest(existing, "replace");
    return {
      handle,
      resolution: "use-folder-data",
      importedFolderData: true,
    };
  }

  const useFolderData = confirmUseFolderData();
  if (useFolderData) {
    await importSyncManifest(existing, "replace");
    return {
      handle,
      resolution: "use-folder-data",
      importedFolderData: true,
    };
  }

  await writeToSyncFolder(handle);
  return {
    handle,
    resolution: "keep-local-data",
    importedFolderData: false,
  };
}

/** Forget the sync folder (keeps manifest/images on disk, just stops syncing). */
export async function disconnectSyncFolder(): Promise<void> {
  await deleteMeta(SYNC_DIR_HANDLE_META_KEY);
  _handle = null;
  _dirty = false;
  _lastDirtyAt = null;
  emitSyncStatus();
}

// ---------------------------------------------------------------------------
// Read / Write
// ---------------------------------------------------------------------------

export async function readFromSyncFolder(handle: DirHandle): Promise<SyncFolderPayload | null> {
  try {
    const fh = await handle.getFileHandle(SYNC_MANIFEST_FILE_NAME, { create: false });
    const file = await fh.getFile();
    const text = await file.text();
    const manifest = JSON.parse(text) as SyncManifest;
    if (manifest.app !== "blue-prince-notes") return null;

    const images: StoredImage[] = [];
    let imagesDir: DirHandle | null = null;
    try {
      imagesDir = await handle.getDirectoryHandle(SYNC_IMAGES_DIR_NAME, { create: false });
    } catch {
      imagesDir = null;
    }

    if (imagesDir) {
      for (const img of manifest.images ?? []) {
        try {
          const imageFile = await imagesDir.getFileHandle(img.fileName, { create: false });
          const blob = await (await imageFile.getFile()).arrayBuffer();
          images.push({
            id: img.id,
            name: img.name,
            caption: img.caption,
            tags: img.tags ?? [],
            mime: img.mime,
            blob: new Blob([blob], { type: img.mime }),
            createdAt: img.createdAt,
          });
        } catch {
          // Skip missing/corrupt image files and continue importing the rest.
        }
      }
    }

    return { manifest, images };
  } catch {
    return null;
  }
}

export async function writeToSyncFolder(handle: DirHandle): Promise<void> {
  const [notes, todos, images, rooms, sections, gridCells] = await Promise.all([
    listNotes(),
    listTodos(),
    listImages(),
    listRoomStates(),
    listSections(),
    listGridCells(),
  ]);
  const customRooms = listCustomRooms().map((r) => ({ name: r.name, category: r.category }));
  const imagesDir = await handle.getDirectoryHandle(SYNC_IMAGES_DIR_NAME, { create: true });
  const imageManifest = [] as Array<Omit<StoredImage, "blob"> & { fileName: string }>;
  const usedFileNames: string[] = [];

  for (const image of images) {
    const fileName = buildUniqueFileName(usedFileNames, image.name, image.id, "png");
    usedFileNames.push(fileName);
    const imageFile = await imagesDir.getFileHandle(fileName, { create: true });
    const writable = await imageFile.createWritable();
    await writable.write(image.blob);
    await writable.close();

    imageManifest.push({
      id: image.id,
      name: image.name,
      caption: image.caption,
      tags: image.tags,
      mime: image.mime,
      createdAt: image.createdAt,
      fileName,
    });
  }

  const manifest: SyncManifest = {
    app: "blue-prince-notes",
    syncVersion: 1,
    syncedAt: Date.now(),
    notes,
    todos,
    images: imageManifest,
    rooms,
    sections,
    gridCells,
    customRooms,
  };

  const fh = await handle.getFileHandle(SYNC_MANIFEST_FILE_NAME, { create: true });
  const writable = await fh.createWritable();
  await writable.write(JSON.stringify(manifest, null, 2));
  await writable.close();
}

/** Import a sync payload into IndexedDB (merge — does not clear existing data). */
export async function importSyncManifest(
  payload: SyncFolderPayload,
  mode: "merge" | "replace" = "merge",
): Promise<void> {
  const { manifest, images } = payload;
  if (mode === "replace") {
    await clearAllData();
    replaceCustomRooms([]);
  }
  for (const n of manifest.notes ?? []) await putNote(n);
  for (const t of manifest.todos ?? []) await putTodo(t);
  for (const i of images ?? []) await putImage(i);
  for (const r of manifest.rooms ?? []) await putRoomState(r);
  for (const s of manifest.sections ?? []) await putSection(s);
  for (const c of manifest.gridCells ?? []) await putGridCell(c);
  if (manifest.customRooms) replaceCustomRooms(manifest.customRooms);
}

// ---------------------------------------------------------------------------
// Debounced auto-write
// ---------------------------------------------------------------------------

let _syncTimer: ReturnType<typeof setTimeout> | null = null;
let _syncIdleHandle: number | null = null;

function clearPendingSyncCallbacks() {
  if (_syncTimer) {
    clearTimeout(_syncTimer);
    _syncTimer = null;
  }

  if (_syncIdleHandle !== null && typeof window !== "undefined" && "cancelIdleCallback" in window) {
    window.cancelIdleCallback(_syncIdleHandle);
    _syncIdleHandle = null;
  }
}

async function flushSyncWrite(handle: DirHandle) {
  try {
    await writeToSyncFolder(handle);
    _dirty = false;
    _lastDirtyAt = null;
    _lastSyncedAt = Date.now();
    emitSyncStatus();
  } catch {
    // Permission may have been revoked — fail silently.
  }
}

export async function saveSyncNow(): Promise<boolean> {
  if (!_handle) return false;
  const granted = await ensureSyncPermission(_handle, true);
  if (!granted) return false;
  clearPendingSyncCallbacks();
  await flushSyncWrite(_handle);
  return true;
}

/** Schedule a sync write after the last mutation burst. No-op when no folder is
 *  connected. */
export function scheduleSyncWrite(): void {
  if (!_handle) return;
  markDirty();

  if (_mode === "manual") {
    return;
  }

  clearPendingSyncCallbacks();
  const handle = _handle;

  _syncTimer = setTimeout(() => {
    _syncTimer = null;

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      _syncIdleHandle = window.requestIdleCallback(
        () => {
          _syncIdleHandle = null;
          void flushSyncWrite(handle);
        },
        { timeout: 2000 },
      );
      return;
    }

    void flushSyncWrite(handle);
  }, 1400);
}

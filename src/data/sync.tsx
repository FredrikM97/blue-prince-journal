/**
 * File System Access API sync runtime.
 *
 * Manages the active folder handle, dirty/clean state, and scheduled writes.
 * Folder I/O is in syncStorage/folderIo.ts; storage read/write goes through
 * the storageAdapter facade.
 */
import { getMeta, setMeta, deleteMeta } from "./db";
import { storageAdapter } from "./storageAdapter";
import { type DirHandle, readFolder, writeFolder } from "./syncStorage/folderIo";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYNC_DIR_HANDLE_META_KEY = "sync-dir-handle";
const SYNC_MODE_META_KEY = "sync-mode";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SyncMode = "auto" | "manual";
export type SyncConnectResolution = "connected-empty" | "use-folder-data" | "keep-local-data";
export type SyncConflictChoice = "overwrite" | "keep" | "cancel";

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function countLocalSyncItems(source: LocalSyncItemSource): number {
  return source.notes.length + source.todos.length + source.images.length + source.gridCells.length;
}

// ---------------------------------------------------------------------------
// Runtime class — owns handle, mode, dirty state, and scheduling
// ---------------------------------------------------------------------------

class SyncRuntimeBase {
  private handle: DirHandle | null = null;
  private mode: SyncMode = "auto";
  private dirty = false;
  private lastDirtyAt: number | null = null;
  private lastSyncedAt: number | null = null;
  private syncTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly statusListeners = new Set<(status: SyncStatus) => void>();

  getActiveHandle(): DirHandle | null {
    return this.handle;
  }

  getActiveFolderName(): string | null {
    return this.handle?.name ?? null;
  }

  getStatus(): SyncStatus {
    return {
      mode: this.mode,
      dirty: this.dirty,
      lastDirtyAt: this.lastDirtyAt,
      lastSyncedAt: this.lastSyncedAt,
    };
  }

  subscribeStatus(listener: (status: SyncStatus) => void) {
    this.statusListeners.add(listener);
    listener(this.getStatus());
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  async loadMode(): Promise<SyncMode> {
    try {
      const stored = await getMeta<SyncMode>(SYNC_MODE_META_KEY);
      this.mode = stored === "manual" ? "manual" : "auto";
    } catch {
      this.mode = "auto";
    }
    this.emitStatus();
    return this.mode;
  }

  async setMode(mode: SyncMode): Promise<void> {
    this.mode = mode;
    await setMeta(SYNC_MODE_META_KEY, mode);
    this.emitStatus();
  }

  async openInPicker(): Promise<boolean> {
    if (!this.handle) return false;
    const picked = await this.openFolder(this.handle);
    return Boolean(picked);
  }

  async restoreHandle(): Promise<DirHandle | null> {
    try {
      const handle = await getMeta<DirHandle>(SYNC_DIR_HANDLE_META_KEY);
      if (!handle) return null;
      const granted = await this.ensurePermission(handle, false);
      if (!granted) return null;
      this.handle = handle;
      return handle;
    } catch {
      return null;
    }
  }

  /** Restores the persisted folder handle (without prompting), then — if
   * `localIsEmpty` is true — reads folder data and merges it into local
   * storage. Call this once on app start after the initial store `load()`.
   * Returns the folder name (for storing in the UI) and whether data was
   * imported from the folder (so the caller knows to reload the store). */
  async boot(
    localIsEmpty: boolean,
  ): Promise<{ folderName: string | null; appliedFolderData: boolean }> {
    const handle = await this.restoreHandle();
    if (!handle) return { folderName: null, appliedFolderData: false };
    const folderName = this.getActiveFolderName();
    if (localIsEmpty) {
      const data = await readFolder(handle);
      if (data) {
        await storageAdapter.write(data);
        return { folderName, appliedFolderData: true };
      }
    }
    return { folderName, appliedFolderData: false };
  }

  async pickFolder(): Promise<DirHandle | null> {
    const handle = await this.openFolder();
    if (!handle) return null;
    // showDirectoryPicker with mode:"readwrite" already grants permission;
    // we still verify to be safe.
    const granted = await this.ensurePermission(handle, true);
    if (!granted) return null;
    await setMeta(SYNC_DIR_HANDLE_META_KEY, handle);
    this.handle = handle;
    this.emitStatus();
    return handle;
  }

  async disconnect(): Promise<void> {
    await deleteMeta(SYNC_DIR_HANDLE_META_KEY);
    this.handle = null;
    this.dirty = false;
    this.lastDirtyAt = null;
    this.clearTimers();
    this.emitStatus();
  }

  markDirty() {
    if (!this.dirty) {
      this.dirty = true;
      this.lastDirtyAt = Date.now();
    }
    this.emitStatus();
  }

  async saveNow(): Promise<boolean> {
    if (!this.handle) return false;
    const granted = await this.ensurePermission(this.handle, true);
    if (!granted) return false;
    this.clearTimers();
    await this.flush(this.handle);
    return true;
  }

  scheduleWrite(): void {
    if (!this.handle) return;
    this.markDirty();
    if (this.mode === "manual") return;
    this.clearTimers();
    const handle = this.handle;
    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      void this.flush(handle);
    }, 1400);
  }

  private emitStatus() {
    const status = this.getStatus();
    this.statusListeners.forEach((listener) => listener(status));
  }

  private clearTimers() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
  }

  private async flush(handle: DirHandle) {
    try {
      const data = await storageAdapter.read();
      await writeFolder(handle, data);
      this.dirty = false;
      this.lastDirtyAt = null;
      this.lastSyncedAt = Date.now();
      this.emitStatus();
    } catch {
      // Permission may have been revoked — fail silently.
    }
  }

  private async ensurePermission(handle: DirHandle, request: boolean): Promise<boolean> {
    const perm = await handle.queryPermission({ mode: "readwrite" });
    if (perm === "granted") return true;
    if (perm === "denied") return false;
    if (!request) return false;
    return (await handle.requestPermission({ mode: "readwrite" })) === "granted";
  }

  private async openFolder(startIn?: DirHandle): Promise<DirHandle | null> {
    try {
      return await window.showDirectoryPicker({ mode: "readwrite", ...(startIn && { startIn }) });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return null;
      throw err;
    }
  }
}

const syncRuntime = new SyncRuntimeBase();
export { syncRuntime };

// ---------------------------------------------------------------------------
// Orchestration — module-level functions with complex logic
// ---------------------------------------------------------------------------

export async function connectSyncFolderWithConflictResolution(
  localItemCount: number,
  resolveConflict: () => Promise<SyncConflictChoice>,
): Promise<SyncConnectResult | null> {
  const handle = await syncRuntime.pickFolder();
  if (!handle) return null;

  const folderData = await readFolder(handle);

  if (!folderData) {
    // Folder is empty — write local data into it.
    const localData = await storageAdapter.read();
    await writeFolder(handle, localData);
    return { handle, resolution: "connected-empty", importedFolderData: false };
  }

  if (localItemCount === 0) {
    // No user content locally — always use folder data.
    await storageAdapter.clear();
    await storageAdapter.write(folderData);
    return { handle, resolution: "use-folder-data", importedFolderData: true };
  }

  // Both sides have data — ask the user what to do.
  const choice = await resolveConflict();

  if (choice === "cancel") {
    await syncRuntime.disconnect();
    return null;
  }

  if (choice === "overwrite") {
    await storageAdapter.clear();
    await storageAdapter.write(folderData);
    return { handle, resolution: "use-folder-data", importedFolderData: true };
  }

  // "keep" — overwrite folder with local data.
  const localData = await storageAdapter.read();
  await writeFolder(handle, localData);
  return { handle, resolution: "keep-local-data", importedFolderData: false };
}

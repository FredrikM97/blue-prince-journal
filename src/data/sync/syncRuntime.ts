import { getMeta, setMeta, deleteMeta, readSnapshot, applySnapshot, clearAllData } from "../db";
import { clearCustomRooms } from "../rooms/rooms";
import type { FsDirectoryHandle as DirHandle } from "./fileAccessTypes";
import { readFolder, writeFolder } from "./syncFolderIO";

const SYNC_DIR_HANDLE_META_KEY = "sync-dir-handle";
const SYNC_MODE_META_KEY = "sync-mode";

export type SyncMode = "auto" | "manual";

export interface SyncStatus {
  mode: SyncMode;
  dirty: boolean;
  lastDirtyAt: number | null;
  lastSyncedAt: number | null;
}

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

  async boot(
    localIsEmpty: boolean,
  ): Promise<{ folderName: string | null; appliedFolderData: boolean }> {
    const handle = await this.restoreHandle();
    if (!handle) return { folderName: null, appliedFolderData: false };
    const folderName = this.getActiveFolderName();
    const data = await readFolder(handle);
    if (data) {
      await clearAllData();
      clearCustomRooms();
      await applySnapshot(data);
      return { folderName, appliedFolderData: true };
    }

    void localIsEmpty;
    return { folderName, appliedFolderData: false };
  }

  async pickFolder(): Promise<DirHandle | null> {
    const handle = await this.openFolder();
    if (!handle) return null;
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
      const data = await readSnapshot();
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

export const syncRuntime = new SyncRuntimeBase();
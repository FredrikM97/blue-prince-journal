/**
 * File System Access API sync runtime.
 *
 * Manages the active folder handle, dirty/clean state, and scheduled writes.
 * Includes folder I/O (manifest + images) and conflict resolution orchestration.
 */
import type { FsDirectoryHandle as DirHandle } from "./fileAccessTypes";
import { syncRuntime } from "./syncRuntime";
export type { SyncMode, SyncStatus } from "./syncRuntime";
export { connectSyncFolderWithConflictResolution } from "./syncConnect";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SyncConnectResolution = "connected-empty" | "use-folder-data" | "keep-local-data";
export type SyncConflictChoice = "overwrite" | "keep" | "cancel";

export interface SyncConnectResult {
  handle: DirHandle;
  resolution: SyncConnectResolution;
  importedFolderData: boolean;
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

export { syncRuntime };

// ---------------------------------------------------------------------------
// Orchestration — module-level functions with complex logic
// ---------------------------------------------------------------------------


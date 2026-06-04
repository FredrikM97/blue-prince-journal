import type { Note, Todo, RoomState, SectionDef, GridCell } from "@/lib/types";
import {
  isLocalStorageAvailable,
  readLocalStorageJson,
  writeLocalStorageJson,
} from "@/data/browserStorage";

export const LOCAL_BACKUP_KEY = "bp-local-backup-v2";

export interface LocalBackupSnapshot {
  version: number;
  savedAt: number;
  notes: Note[];
  todos: Todo[];
  rooms: RoomState[];
  sections: SectionDef[];
  gridCells: GridCell[];
}

export function canUseLocalStorage(): boolean {
  return isLocalStorageAvailable();
}

export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

export function readLocalBackup(key: string): LocalBackupSnapshot | null {
  if (!canUseLocalStorage()) return null;
  const parsed = readLocalStorageJson<Partial<LocalBackupSnapshot>>(key);
  if (!parsed) return null;
  return {
    version: typeof parsed.version === "number" ? parsed.version : 1,
    savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    todos: Array.isArray(parsed.todos) ? parsed.todos : [],
    rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    gridCells: Array.isArray(parsed.gridCells) ? parsed.gridCells : [],
  };
}

export function writeLocalBackup(key: string, snapshot: LocalBackupSnapshot): void {
  if (!canUseLocalStorage()) return;
  writeLocalStorageJson(key, snapshot);
}

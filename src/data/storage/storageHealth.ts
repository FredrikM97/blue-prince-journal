import type { Note, Todo, RoomState, SectionDef, GridCell } from "@/lib/types";

// ---------------------------------------------------------------------------
// localStorage utilities
// ---------------------------------------------------------------------------

function getLocalStorageValue(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function setLocalStorageValue(key: string, value: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function getLocalStorageFlag(key: string): boolean {
  return getLocalStorageValue(key) === "1";
}

export function setLocalStorageFlag(key: string): boolean {
  return setLocalStorageValue(key, "1");
}

export { getLocalStorageValue };

export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

// ---------------------------------------------------------------------------
// Types kept for potential future use but not actively written
// ---------------------------------------------------------------------------

export interface LocalBackupSnapshot {
  version: number;
  savedAt: number;
  notes: Note[];
  todos: Todo[];
  rooms: RoomState[];
  sections: SectionDef[];
  gridCells: GridCell[];
}


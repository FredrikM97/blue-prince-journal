import type { RoomCategory } from "@/data/rooms";
import type { GridCell, Note, RoomState, SectionDef, StoredImage, Todo } from "@/lib/types";

/** Full snapshot of all app data — returned by a storage read, passed to a write. */
export interface AppDataSnapshot {
  notes: Note[];
  todos: Todo[];
  images: StoredImage[];
  rooms: RoomState[];
  sections: SectionDef[];
  gridCells: GridCell[];
  customRooms: Array<{ name: string; category: RoomCategory }>;
}

/** Storage backend interface — implemented by browserDbStorage and localDbStorage. */
export interface StorageAdapter {
  read(): Promise<AppDataSnapshot>;
  /** Wipe all data in this backend. Call before write() to get replace semantics. */
  clear(): Promise<void>;
  write(data: AppDataSnapshot): Promise<void>;
}

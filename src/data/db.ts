import Dexie, { type Table } from "dexie";
import type { Note, Todo, StoredImage, RoomState, SectionDef, GridCell } from "@/lib/types";
import { listCustomRooms, replaceCustomRooms, cellId, type RoomCategory } from "@/data/rooms/rooms";

// ---------------------------------------------------------------------------
// Snapshot type (used by sync and io)
// ---------------------------------------------------------------------------

export interface AppDataSnapshot {
  notes: Note[];
  todos: Todo[];
  images: StoredImage[];
  rooms: RoomState[];
  sections: SectionDef[];
  gridCells: GridCell[];
  customRooms: Array<{ name: string; category: RoomCategory }>;
}

// ---------------------------------------------------------------------------
// Dexie schema — same DB name and version as the previous idb implementation
// ---------------------------------------------------------------------------

class JournalDb extends Dexie {
  notes!: Table<Note>;
  todos!: Table<Todo>;
  images!: Table<StoredImage>;
  rooms!: Table<RoomState, string>;
  sections!: Table<SectionDef>;
  grid!: Table<GridCell>;
  meta!: Table<unknown, string>;

  constructor() {
    super("blue-prince-notes");
    this.version(1).stores({
      notes: "id, updatedAt, type, room",
      todos: "id, updatedAt, status",
      images: "id",
      rooms: "name",
      sections: "id",
      meta: "",
    });
    this.version(2).stores({
      grid: "id, row, col",
    });
  }
}

export const db = new JournalDb();

// ---------------------------------------------------------------------------
// Snapshot read / write
// ---------------------------------------------------------------------------

export async function readSnapshot(): Promise<AppDataSnapshot> {
  const [notes, todos, images, rooms, sections, gridCells] = await Promise.all([
    db.notes.orderBy("updatedAt").reverse().toArray(),
    db.todos.orderBy("updatedAt").reverse().toArray(),
    db.images.toArray(),
    db.rooms.toArray(),
    db.sections.toArray(),
    db.grid.toArray(),
  ]);
  const customRooms = listCustomRooms().map((r) => ({ name: r.name, category: r.category }));
  return { notes, todos, images, rooms, sections, gridCells, customRooms };
}

export async function applySnapshot(data: AppDataSnapshot): Promise<void> {
  await Promise.all([
    db.notes.bulkPut(data.notes),
    db.todos.bulkPut(data.todos),
    db.images.bulkPut(data.images),
    db.rooms.bulkPut(data.rooms),
    db.sections.bulkPut(data.sections),
    db.grid.bulkPut(data.gridCells),
  ]);
  if (data.customRooms.length > 0) {
    const existing = listCustomRooms().map((r) => ({ name: r.name, category: r.category }));
    replaceCustomRooms(mergeByName(existing, data.customRooms));
  }
}

function mergeByName<T extends { name: string }>(base: T[], incoming: T[]): T[] {
  const map = new Map(base.map((item) => [item.name, item]));
  for (const item of incoming) {
    map.set(item.name, item);
  }
  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// Meta key/value store
// ---------------------------------------------------------------------------

export async function getMeta<T>(key: string): Promise<T | undefined> {
  return db.meta.get(key) as Promise<T | undefined>;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put(value, key);
}

export async function deleteMeta(key: string): Promise<void> {
  await db.meta.delete(key);
}

// ---------------------------------------------------------------------------
// Clear all user data (keeps meta / config intact)
// ---------------------------------------------------------------------------

export async function clearAllData(): Promise<void> {
  await db.transaction(
    "rw",
    [db.notes, db.todos, db.images, db.rooms, db.sections, db.grid],
    async () => {
      await Promise.all([
        db.notes.clear(),
        db.todos.clear(),
        db.images.clear(),
        db.rooms.clear(),
        db.sections.clear(),
        db.grid.clear(),
      ]);
    },
  );
}

// ---------------------------------------------------------------------------
// Boot seeding — call once on app start
// ---------------------------------------------------------------------------

const BUILTIN_SECTIONS: SectionDef[] = [
  { id: "notes", label: "Notes", builtin: "notes", order: 0 },
  { id: "todos", label: "Todo", builtin: "todos", order: 1 },
  { id: "map", label: "Map", builtin: "map", order: 3 },
  { id: "graph", label: "Graph", builtin: "graph", order: 4 },
  { id: "images", label: "Images", builtin: "images", order: 5 },
];

const SEEDED_MAP_CELLS: Array<Pick<GridCell, "row" | "col" | "roomName" | "status">> = [
  { row: 0, col: 2, roomName: "Antechamber", status: "unknown" },
  { row: 8, col: 2, roomName: "Entrance Hall", status: "unknown" },
];

export async function ensureBootSeed(): Promise<void> {
  const existing = await db.sections.toArray();
  const existingById = new Map(existing.map((s) => [s.id, s]));

  for (const builtin of BUILTIN_SECTIONS) {
    const prev = existingById.get(builtin.id);
    if (!prev) {
      await db.sections.put(builtin);
      continue;
    }
    const next: SectionDef = {
      ...prev,
      label: builtin.label,
      order: builtin.order,
      builtin: builtin.builtin,
      filter: builtin.filter,
    };
    const changed =
      prev.label !== next.label ||
      prev.order !== next.order ||
      prev.builtin !== next.builtin ||
      prev.filter?.type !== next.filter?.type;
    if (changed) await db.sections.put(next);
  }

  const existingCells = await db.grid.toArray();
  const existingIds = new Set(existingCells.map((c) => c.id));
  const now = Date.now();
  for (const seed of SEEDED_MAP_CELLS) {
    const id = cellId(seed.row, seed.col);
    if (existingIds.has(id)) continue;
    await db.grid.put({
      id,
      row: seed.row,
      col: seed.col,
      roomName: seed.roomName,
      status: seed.status,
      updatedAt: now,
    });
  }
}

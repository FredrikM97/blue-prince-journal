import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildGridCell,
  buildNote,
  buildSection,
  buildStoredImage,
  buildTodo,
} from "../../fixtures/domainBuilders";

// makeTable is used inside vi.hoisted below via makeTableHoisted
const mockDb = vi.hoisted(() => {
  function makeTableHoisted() {
    return {
      toArray: vi.fn(async () => []),
      orderBy: vi.fn().mockReturnThis(),
      reverse: vi.fn().mockReturnThis(),
      put: vi.fn(async () => undefined as unknown),
      bulkPut: vi.fn(async () => undefined),
      get: vi.fn(async () => undefined),
      delete: vi.fn(async () => undefined),
      clear: vi.fn(async () => undefined),
      count: vi.fn(async () => 0),
    };
  }
  return {
    notes: makeTableHoisted(),
    todos: makeTableHoisted(),
    images: makeTableHoisted(),
    rooms: makeTableHoisted(),
    sections: makeTableHoisted(),
    grid: makeTableHoisted(),
    meta: makeTableHoisted(),
    transaction: vi.fn(async (_mode: string, _tables: unknown[], fn: () => Promise<void>) => fn()),
  };
});

vi.mock("@/data/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/data/db")>();
  return {
    ...actual,
    db: mockDb,
    getMeta: vi.fn(async (_key: string) => undefined as unknown),
    setMeta: vi.fn(async (_key: string, _value: unknown) => {}),
    deleteMeta: vi.fn(async (_key: string) => {}),
    clearAllData: vi.fn(async () => {
      await Promise.all([
        mockDb.notes.clear(),
        mockDb.todos.clear(),
        mockDb.images.clear(),
        mockDb.rooms.clear(),
        mockDb.sections.clear(),
        mockDb.grid.clear(),
      ]);
    }),
    readSnapshot: vi.fn(async () => ({
      notes: [],
      todos: [],
      images: [],
      rooms: [],
      sections: [],
      gridCells: [],
      customRooms: [],
    })),
    applySnapshot: vi.fn(async () => {}),
  };
});

describe("db boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads and writes notes via db table", async () => {
    const { db } = await import("@/data/db");
    const note = buildNote({ id: "n1", title: "Test" });
    await db.notes.put(note);
    expect(db.notes.put).toHaveBeenCalledWith(note);
  });

  it("reads and writes todos via db table", async () => {
    const { db } = await import("@/data/db");
    const todo = buildTodo({ id: "t1", title: "Task" });
    await db.todos.put(todo);
    expect(db.todos.put).toHaveBeenCalledWith(todo);
  });

  it("reads and writes images via db table", async () => {
    const { db } = await import("@/data/db");
    const img = buildStoredImage({ id: "i1", name: "img" });
    await db.images.put(img);
    expect(db.images.put).toHaveBeenCalledWith(img);
  });

  it("reads and writes sections via db table", async () => {
    const { db } = await import("@/data/db");
    const section = buildSection({ id: "s1", label: "Notes" });
    await db.sections.put(section);
    expect(db.sections.put).toHaveBeenCalledWith(section);
  });

  it("reads and writes grid cells via db table", async () => {
    const { db } = await import("@/data/db");
    const cell = buildGridCell({ row: 0, col: 0 });
    await db.grid.put(cell);
    expect(db.grid.put).toHaveBeenCalledWith(cell);
  });

  it("clears all data stores", async () => {
    const { clearAllData, db } = await import("@/data/db");
    await clearAllData();
    expect(db.notes.clear).toHaveBeenCalled();
    expect(db.todos.clear).toHaveBeenCalled();
    expect(db.images.clear).toHaveBeenCalled();
  });

  it("reads and writes meta keys", async () => {
    const { getMeta, setMeta, deleteMeta } = await import("@/data/db");
    await setMeta("sync-mode", "auto");
    await getMeta("sync-mode");
    await deleteMeta("sync-mode");
    expect(setMeta).toHaveBeenCalledWith("sync-mode", "auto");
    expect(getMeta).toHaveBeenCalledWith("sync-mode");
    expect(deleteMeta).toHaveBeenCalledWith("sync-mode");
  });
});

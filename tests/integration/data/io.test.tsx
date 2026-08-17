import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GridCell, Note, RoomState, SectionDef, StoredImage, Todo } from "@/lib/types";
import { buildNote, buildStoredImage, buildTodo } from "../../fixtures/domainBuilders";

function makeTable<T>() {
  const toArray = vi.fn<() => Promise<T[]>>(async () => []);
  return {
    toArray,
    orderBy: vi.fn(() => ({ reverse: () => ({ toArray }) })),
    put: vi.fn(async (_v: T) => {}),
    bulkPut: vi.fn(async (_v: T[]) => {}),
    clear: vi.fn(async () => {}),
  };
}

const db = {
  notes: makeTable<Note>(),
  todos: makeTable<Todo>(),
  images: makeTable<StoredImage>(),
  rooms: makeTable<RoomState>(),
  sections: makeTable<SectionDef>(),
  grid: makeTable<GridCell>(),
};

const rooms = {
  listCustomRooms: vi.fn(() => []),
  replaceCustomRooms: vi.fn(),
};

let lastZipInstance: FakeZip | null = null;
let loadedZipInstance: FakeZip | null = null;

class FakeZip {
  static latest: FakeZip | null = null;

  private store = new Map<string, unknown>();

  constructor() {
    FakeZip.latest = this;
  }

  file(path: string, value?: unknown) {
    if (value === undefined) {
      if (!this.store.has(path)) return null;
      return {
        async: async (type: string) => {
          const v = this.store.get(path);
          if (type === "text") return String(v ?? "");
          if (type === "blob") return v instanceof Blob ? v : new Blob([String(v ?? "")]);
          return v;
        },
      };
    }
    this.store.set(path, value);
    return this;
  }

  async generateAsync() {
    return new Blob(["zip-blob"], { type: "application/zip" });
  }

  static async loadAsync() {
    if (!loadedZipInstance) throw new Error("no loaded zip");
    return loadedZipInstance;
  }
}

vi.mock("@/data/db", () => ({ db }));
vi.mock("@/data/rooms/rooms", () => rooms);
vi.mock("jszip", () => ({ default: FakeZip }));

describe("io boundaries", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    lastZipInstance = null;
    loadedZipInstance = null;
    FakeZip.latest = null;

    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
  });

  it("exports data into zip and triggers download", async () => {
    db.notes.toArray.mockResolvedValueOnce([buildNote({ id: "n1", title: "note" })]);
    db.todos.toArray.mockResolvedValueOnce([buildTodo({ id: "t1", title: "todo" })]);
    db.images.toArray.mockResolvedValueOnce([
      buildStoredImage({ id: "img-1", name: "image.png", caption: "c" }),
    ]);

    const click = vi.fn();
    vi.spyOn(document, "createElement").mockReturnValue({
      click,
      href: "",
      download: "",
    } as unknown as HTMLAnchorElement);

    const io = await import("@/data/storage/backup");
    await io.exportAll();

    lastZipInstance = FakeZip.latest;
    expect(lastZipInstance).not.toBeNull();
    expect(click).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it("imports legacy json data", async () => {
    const io = await import("@/data/storage/backup");
    const legacyJson = JSON.stringify({
      app: "blue-prince-notes",
      version: 2,
      exportedAt: Date.now(),
      notes: [{ id: "n1" }],
      todos: [{ id: "t1" }],
      images: [],
      rooms: [],
      sections: [],
      gridCells: [],
    });
    const file = {
      name: "backup.json",
      type: "application/json",
      text: async () => legacyJson,
    } as File;

    await io.importAll(file, "merge");

    expect(db.notes.put).toHaveBeenCalled();
    expect(db.todos.put).toHaveBeenCalled();
  });

  it("imports zip manifest and image blobs", async () => {
    const manifest = {
      app: "blue-prince-notes",
      version: 4,
      exportedAt: Date.now(),
      notes: [{ id: "n1" }],
      todos: [{ id: "t1" }],
      images: [
        {
          id: "img-1",
          name: "image.png",
          caption: "c",
          tags: [],
          mime: "image/png",
          createdAt: 1,
          file: "images/img-1",
        },
      ],
      rooms: [],
      sections: [],
      gridCells: [],
      customRooms: [{ name: "Parlor", category: "Wing" }],
    };

    loadedZipInstance = new FakeZip();
    loadedZipInstance.file("manifest.json", JSON.stringify(manifest));
    loadedZipInstance.file("images/img-1", new Blob(["img"], { type: "image/png" }));

    const io = await import("@/data/storage/backup");
    const zipFile = {
      name: "backup.zip",
      type: "application/zip",
      arrayBuffer: async () => new ArrayBuffer(0),
    } as File;
    await io.importAll(zipFile, "replace");

    expect(db.notes.put).toHaveBeenCalled();
    expect(db.todos.put).toHaveBeenCalled();
    expect(db.images.put).toHaveBeenCalled();
    expect(rooms.replaceCustomRooms).toHaveBeenCalled();
  });
});

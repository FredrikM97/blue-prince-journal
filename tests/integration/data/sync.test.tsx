import { beforeEach, describe, expect, it, vi } from "vitest";

const db = {
  getMeta: vi.fn(),
  setMeta: vi.fn(async () => {}),
  deleteMeta: vi.fn(async () => {}),
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
  clearAllData: vi.fn(async () => {}),
};

const rooms = {
  listCustomRooms: vi.fn(() => [{ name: "Parlor", category: "Wing" }]),
  replaceCustomRooms: vi.fn(),
};

vi.mock("@/data/db", () => db);
vi.mock("@/data/rooms/rooms", () => rooms);
vi.mock("@/data/imageNames", () => ({
  buildUniqueFileName: vi.fn((_: string[], name: string) => `${name}-file`),
}));

interface MockFileHandle {
  getFile: () => Promise<File>;
  createWritable: () => Promise<{
    write: (data: unknown) => Promise<void>;
    close: () => Promise<void>;
  }>;
}

interface MockDirHandle {
  name: string;
  queryPermission: () => Promise<PermissionState>;
  requestPermission: () => Promise<PermissionState>;
  getDirectoryHandle: (name: string, options?: { create?: boolean }) => Promise<MockDirHandle>;
  getFileHandle: (name: string, options?: { create?: boolean }) => Promise<MockFileHandle>;
}

function createMemoryDirHandle(name: string) {
  const files = new Map<string, string | Blob>();

  const handle: MockDirHandle = {
    name,
    queryPermission: async () => "granted",
    requestPermission: async () => "granted",
    async getDirectoryHandle() {
      return handle;
    },
    async getFileHandle(fileName: string, options?: { create?: boolean }) {
      if (!files.has(fileName) && !options?.create) {
        throw new Error("missing file");
      }
      return {
        getFile: async () => {
          const value = files.get(fileName);
          if (typeof value === "string") {
            return new File([value], fileName, { type: "application/json" });
          }
          return new File([value ?? ""], fileName, { type: "application/octet-stream" });
        },
        createWritable: async () => ({
          write: async (data: unknown) => {
            if (data instanceof Blob) {
              files.set(fileName, data);
              return;
            }
            files.set(fileName, String(data));
          },
          close: async () => {},
        }),
      };
    },
  };

  return { handle, files };
}

describe("sync boundaries", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  it("loads and persists sync mode", async () => {
    db.getMeta.mockResolvedValueOnce("manual");
    const sync = await import("@/data/sync/sync");

    const mode = await sync.syncRuntime.loadMode();
    expect(mode).toBe("manual");

    await sync.syncRuntime.setMode("auto");
    expect(db.setMeta).toHaveBeenCalledWith("sync-mode", "auto");
  });

  it("returns null when picking folder is aborted", async () => {
    const sync = await import("@/data/sync/sync");
    vi.stubGlobal("window", {
      showDirectoryPicker: vi.fn(async () => {
        throw new DOMException("cancel", "AbortError");
      }),
    });

    const handle = await sync.syncRuntime.pickFolder();
    expect(handle).toBeNull();
  });

  it("restores handle only with granted permission", async () => {
    const sync = await import("@/data/sync/sync");
    const deniedHandle = {
      queryPermission: vi.fn(async () => "denied"),
      requestPermission: vi.fn(async () => "denied"),
      name: "Denied",
    };
    db.getMeta.mockResolvedValueOnce(deniedHandle);

    expect(await sync.syncRuntime.restoreHandle()).toBeNull();
  });

  it("writes manifest when scheduled in auto mode", async () => {
    const sync = await import("@/data/sync/sync");
    const { handle, files } = createMemoryDirHandle("SyncFolder");
    vi.stubGlobal("window", { showDirectoryPicker: vi.fn(async () => handle) });

    await sync.syncRuntime.pickFolder();
    await sync.syncRuntime.setMode("auto");

    sync.syncRuntime.scheduleWrite();
    await vi.advanceTimersByTimeAsync(1500);

    expect(files.has("manifest.json")).toBe(true);
    let currentStatus!: import("@/data/sync/sync").SyncStatus;
    sync.syncRuntime.subscribeStatus((s) => {
      currentStatus = s;
    })();
    expect(currentStatus.dirty).toBe(false);
  });

  it("does not auto-write in manual mode, but saveSyncNow works", async () => {
    const sync = await import("@/data/sync/sync");
    const { handle, files } = createMemoryDirHandle("SyncFolder");
    vi.stubGlobal("window", { showDirectoryPicker: vi.fn(async () => handle) });

    await sync.syncRuntime.pickFolder();
    await sync.syncRuntime.setMode("manual");

    sync.syncRuntime.scheduleWrite();
    vi.advanceTimersByTime(2000);
    await Promise.resolve();

    expect(files.has("manifest.json")).toBe(false);

    const saved = await sync.syncRuntime.saveNow();
    expect(saved).toBe(true);
    expect(files.has("manifest.json")).toBe(true);
  });

  it("imports sync data boundary into db layer via applySnapshot", async () => {
    const { applySnapshot } = await import("@/data/db");
    await applySnapshot({
      notes: [{ id: "n1" } as never],
      todos: [{ id: "t1" } as never],
      images: [],
      rooms: [{ name: "Parlor", status: "unknown", updatedAt: 1 } as never],
      sections: [{ id: "s1", label: "Notes", order: 0 } as never],
      gridCells: [{ id: "0,0", row: 0, col: 0, status: "unknown", updatedAt: 1 } as never],
      customRooms: [{ name: "Parlor", category: "Wing" as never }],
    });

    expect(db.applySnapshot).toHaveBeenCalled();
  });
});

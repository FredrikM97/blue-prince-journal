import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Note, Todo } from "@/lib/types";
import { buildNote, buildTodo } from "../../fixtures/domainBuilders";
import { useStore } from "@/hooks/useStore";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockScheduleWrite = vi.fn();

vi.mock("@/data/sync/sync", () => ({
  syncRuntime: {
    scheduleWrite: mockScheduleWrite,
    disconnect: vi.fn(async () => {}),
  },
}));

const mockDb = {
  notes: {
    put: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    get: vi.fn(async () => undefined),
    toArray: vi.fn(async () => []),
  },
  todos: {
    put: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    get: vi.fn(async () => undefined),
    toArray: vi.fn(async () => []),
  },
  images: {
    put: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    toArray: vi.fn(async () => []),
  },
  rooms: {
    put: vi.fn(async () => {}),
    toArray: vi.fn(async () => []),
  },
  sections: {
    put: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    toArray: vi.fn(async () => []),
  },
  grid: {
    put: vi.fn(async () => {}),
    delete: vi.fn(async () => {}),
    get: vi.fn(async () => undefined),
    toArray: vi.fn(async () => []),
  },
  meta: {
    put: vi.fn(async () => {}),
  },
  transaction: vi.fn(async (_m: string, _t: unknown[], fn: () => Promise<void>) => fn()),
};

vi.mock("@/data/db", () => ({
  db: mockDb,
  clearAllData: vi.fn(async () => {}),
  ensureBootSeed: vi.fn(async () => {}),
  getMeta: vi.fn(async () => undefined),
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
}));

vi.mock("@/data/rooms/rooms", () => ({
  cellId: (row: number, col: number) => `${row},${col}`,
  clearCustomRooms: vi.fn(),
}));

vi.mock("@/data/imageNames", () => ({
  buildUniqueFileName: vi.fn(() => "image-unique.png"),
}));

vi.mock("@/data/parse", () => ({
  parseCapture: vi.fn(() => ({
    isTodo: false,
    title: "Parsed Title",
    room: "",
    tags: [],
    type: "observation",
    status: "open",
    scope: "cross-run",
    date: "",
    priority: undefined,
  })),
}));

vi.mock("nanoid", () => ({ nanoid: vi.fn(() => "mock-id") }));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("UIState (store)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useStore.setState({
      loaded: false,
      search: "",
      syncFolderName: null,
      steamFolderName: null,
      captureOpen: false,
      captureDefault: "note",
      capturePrefill: "",
      capturePrefillRoom: undefined,
      capturePrefillBody: "",
      capturePrefillTags: "",
      capturePrefillType: undefined,
      capturePrefillPriority: undefined,
      captureEditNoteId: undefined,
      captureEditTodoId: undefined,
      captureReturnTo: undefined,
    });
  });

  it("opens capture from note and closes cleanly", () => {
    const note: Note = buildNote({
      id: "n1",
      title: "Door code",
      body: "check room",
      room: "Parlor",
      tags: ["tag1"],
    });

    useStore.getState().openCapture({ note, returnTo: "/section/map" });

    const state = useStore.getState();
    expect(state.captureOpen).toBe(true);
    expect(state.captureEditNoteId).toBe("n1");
    expect(state.capturePrefill).toBe("Door code");
    expect(state.captureReturnTo).toBe("/section/map");

    state.closeCapture();
    expect(useStore.getState().captureOpen).toBe(false);
    expect(useStore.getState().capturePrefill).toBe("");
  });

  it("opens capture from todo and closes cleanly", () => {
    const todo: Todo = buildTodo({ id: "t1", title: "Task", priority: "high" });

    useStore.getState().openCapture({ todo });

    const state = useStore.getState();
    expect(state.captureOpen).toBe(true);
    expect(state.captureDefault).toBe("todo");
    expect(state.captureEditTodoId).toBe("t1");
    expect(state.capturePrefillPriority).toBe("high");
  });

  it("setSearch updates search state", () => {
    useStore.getState().setSearch("test query");
    expect(useStore.getState().search).toBe("test query");
  });

  it("setSyncFolderName updates syncFolderName", () => {
    useStore.getState().setSyncFolderName("MyFolder");
    expect(useStore.getState().syncFolderName).toBe("MyFolder");
  });
});

describe("mutations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("saveNote writes to db and schedules sync", async () => {
    const { saveNote } = await import("@/data/mutations/noteMutations");
    const note = buildNote({ id: "n1", title: "Test" });
    await saveNote(note);
    expect(mockDb.notes.put).toHaveBeenCalled();
    expect(mockScheduleWrite).toHaveBeenCalled();
  });

  it("saveTodo writes to db and schedules sync", async () => {
    const { saveTodo } = await import("@/data/mutations/todoMutations");
    const todo = buildTodo({ id: "t1", title: "Task" });
    await saveTodo(todo);
    expect(mockDb.todos.put).toHaveBeenCalled();
    expect(mockScheduleWrite).toHaveBeenCalled();
  });

  it("removeNote deletes from db and schedules sync", async () => {
    const { removeNote } = await import("@/data/mutations/noteMutations");
    await removeNote("n1");
    expect(mockDb.notes.delete).toHaveBeenCalledWith("n1");
    expect(mockScheduleWrite).toHaveBeenCalled();
  });

  it("removeTodo deletes from db and schedules sync", async () => {
    const { removeTodo } = await import("@/data/mutations/todoMutations");
    await removeTodo("t1");
    expect(mockDb.todos.delete).toHaveBeenCalledWith("t1");
    expect(mockScheduleWrite).toHaveBeenCalled();
  });

  it("toggleTodoStatus updates todo status", async () => {
    const { toggleTodoStatus } = await import("@/data/mutations/todoMutations");
    const todo = buildTodo({ id: "t1", status: "open" });
    mockDb.todos.get.mockResolvedValueOnce(todo as never);
    await toggleTodoStatus("t1", "done");
    const putArg = (mockDb.todos.put as ReturnType<typeof vi.fn>).mock.calls[0][0] as Todo;
    expect(putArg.status).toBe("done");
    expect(putArg.completedAt).toBeTypeOf("number");
  });

  it("addImage creates unique-named image in db", async () => {
    const { addImage } = await import("@/data/mutations/imageMutations");
    mockDb.images.toArray.mockResolvedValueOnce([]);
    const blob = new Blob(["img"], { type: "image/png" });
    const img = await addImage(blob, "original.png");
    expect(img.name).toBe("image-unique.png");
    expect(mockDb.images.put).toHaveBeenCalled();
  });

  it("upsertCell writes grid cell to db", async () => {
    const { upsertCell } = await import("@/data/mutations/mapMutations");
    mockDb.grid.get.mockResolvedValueOnce(undefined);
    await upsertCell({ row: 1, col: 2, roomName: "Library" });
    const putArg = (mockDb.grid.put as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(putArg.id).toBe("1,2");
    expect(putArg.roomName).toBe("Library");
  });

  it("clearCell deletes grid cell from db", async () => {
    const { clearCell } = await import("@/data/mutations/mapMutations");
    await clearCell(1, 2);
    expect(mockDb.grid.delete).toHaveBeenCalledWith("1,2");
  });
});

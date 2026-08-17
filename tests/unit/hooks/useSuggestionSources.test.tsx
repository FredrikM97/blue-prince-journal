import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const ctx = vi.hoisted(() => ({
  notes: [] as Array<{ room?: string; tags: string[] }>,
  todos: [] as Array<{ room?: string; tags: string[] }>,
  gridCells: [] as Array<{ roomName?: string }>,
  catalog: [{ name: "Entrance Hall" }, { name: "Parlor" }],
}));

vi.mock("dexie-react-hooks", () => ({
  useLiveQuery: (query: () => unknown) => {
    const result = query();
    return result;
  },
}));

vi.mock("@/data/db", () => ({
  db: {
    notes: { toArray: () => ctx.notes },
    todos: { toArray: () => ctx.todos },
    grid: { toArray: () => ctx.gridCells },
  },
}));

vi.mock("@/data/rooms/rooms", () => ({
  getRoomCatalog: () => ctx.catalog,
}));

import { useSuggestionSources } from "@/components/common/suggestions/useSuggestionSources";

describe("useSuggestionSources", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ctx.notes = [];
    ctx.todos = [];
    ctx.gridCells = [];
  });

  it("builds room and tag suggestions from notes/todos/grid and catalog", () => {
    ctx.notes = [
      { room: "Library", tags: ["puzzle", "story"] },
      { room: "Parlor", tags: ["story"] },
    ];
    ctx.todos = [{ room: "Entrance Hall", tags: ["todo-tag"] }];
    ctx.gridCells = [{ roomName: "Attic" }, { roomName: "" }];

    const { result } = renderHook(() => useSuggestionSources());

    expect(result.current.roomSuggestions).toEqual(["Attic", "Entrance Hall", "Library", "Parlor"]);
    expect(result.current.tagSuggestions).toEqual(["puzzle", "story", "todo-tag"]);
  });
});


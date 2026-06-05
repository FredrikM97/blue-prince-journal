import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useNotesPageData } from "@/hooks/useNotesPageData";
import type { Note, Todo } from "@/lib/types";

const notes: Note[] = [
  {
    id: "n1",
    type: "clue",
    title: "Library clue",
    body: "Look near the exit",
    room: "Library",
    tags: ["puzzle"],
    status: "open",
    scope: "this-run",
    imageIds: [],
    createdAt: 1,
    updatedAt: 2,
  },
];

const todos: Todo[] = [
  {
    id: "t1",
    title: "Check attic",
    notes: "Search the west shelf",
    room: "Attic",
    tags: ["investigate"],
    status: "open",
    scope: "this-run",
    priority: "med",
    linkedNoteIds: [],
    createdAt: 3,
    updatedAt: 4,
  },
];

describe("useNotesPageData", () => {
  it("derives the combined list and applies filters", () => {
    const { result } = renderHook(() =>
      useNotesPageData({
        notes,
        todos,
        search: "library",
        filterType: "clue",
        roomFilters: [],
        tagFilter: null,
        statusFilter: null,
      }),
    );

    expect(result.current.rooms).toEqual(["Attic", "Library"]);
    expect(result.current.tags).toEqual(["investigate", "puzzle"]);
    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.id).toBe("n1");
  });

  it("supports room/tag/note tokens and excluded terms", () => {
    const { result } = renderHook(() =>
      useNotesPageData({
        notes,
        todos,
        search: "@library #puzzle ^library -exit",
        filterType: undefined,
        roomFilters: [],
        tagFilter: null,
        statusFilter: null,
      }),
    );

    expect(result.current.filtered).toHaveLength(0);
  });

  it("matches token fields by type", () => {
    const { result } = renderHook(() =>
      useNotesPageData({
        notes,
        todos,
        search: "@library #puzzle ^library",
        filterType: undefined,
        roomFilters: [],
        tagFilter: null,
        statusFilter: null,
      }),
    );

    expect(result.current.filtered).toHaveLength(1);
    expect(result.current.filtered[0]?.id).toBe("n1");
  });

  it("supports multiple selected room filters", () => {
    const { result } = renderHook(() =>
      useNotesPageData({
        notes,
        todos,
        search: "",
        filterType: undefined,
        roomFilters: ["Library", "Attic"],
        tagFilter: null,
        statusFilter: null,
      }),
    );

    expect(result.current.filtered).toHaveLength(2);
  });
});

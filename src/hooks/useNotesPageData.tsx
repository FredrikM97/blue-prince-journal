import { useMemo } from "react";
import type { Note, NoteType, Todo } from "@/lib/types";
import { matchesSearchQuery, parseSearchQuery } from "@/lib/searchQuery";

export function useNotesPageData({
  notes,
  todos,
  search,
  filterType,
  roomFilter,
  tagFilter,
  statusFilter,
}: {
  notes: Note[];
  todos: Todo[];
  search: string;
  filterType?: NoteType;
  roomFilter: string | null;
  tagFilter: string | null;
  statusFilter: "open" | "solved" | null;
}) {
  const noteListItems = useMemo(() => {
    const todoNotes: Note[] = todos.map((todo) => ({
      id: `todo:${todo.id}`,
      type: "task",
      title: todo.title,
      body: todo.body ?? "",
      room: todo.room,
      tags: todo.tags,
      date: undefined,
      status: todo.status === "done" ? "solved" : "open",
      scope: todo.scope === "someday" ? "cross-run" : todo.scope,
      imageIds: todo.imageIds ?? [],
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    }));

    return [...notes, ...todoNotes].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [notes, todos]);

  const rooms = useMemo(() => {
    const set = new Set<string>();
    noteListItems.forEach((note) => note.room && set.add(note.room));
    return Array.from(set).sort();
  }, [noteListItems]);

  const tags = useMemo(() => {
    const set = new Set<string>();
    noteListItems.forEach((note) => note.tags.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [noteListItems]);

  const filtered = useMemo(() => {
    const query = parseSearchQuery(search);
    return noteListItems.filter((note) => {
      if (filterType && note.type !== filterType) return false;
      if (roomFilter && note.room !== roomFilter) return false;
      if (tagFilter && !note.tags.includes(tagFilter)) return false;
      if (statusFilter && note.status !== statusFilter) return false;
      if (!matchesSearchQuery(note, query)) return false;
      return true;
    });
  }, [noteListItems, filterType, roomFilter, tagFilter, statusFilter, search]);

  return { filtered, rooms, tags, noteListItems };
}

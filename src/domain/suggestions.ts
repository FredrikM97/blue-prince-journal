import type { GridCell, Note, Todo } from "@/lib/types";

export interface SuggestionSources {
  roomSuggestions: string[];
  tagSuggestions: string[];
  noteSuggestions: string[];
}

export function buildSuggestionSources({
  roomCatalog,
  notes,
  todos,
  gridCells,
}: {
  roomCatalog: string[];
  notes: Note[];
  todos: Todo[];
  gridCells: GridCell[];
}): SuggestionSources {
  const allRooms = new Set<string>();
  roomCatalog.forEach((room) => allRooms.add(room));
  gridCells.forEach((cell) => cell.roomName?.trim() && allRooms.add(cell.roomName.trim()));
  notes.forEach((note) => note.room?.trim() && allRooms.add(note.room.trim()));
  todos.forEach((todo) => todo.room?.trim() && allRooms.add(todo.room.trim()));

  const allTags = new Set<string>();
  notes.forEach((note) => note.tags.forEach((tag) => allTags.add(tag)));
  todos.forEach((todo) => todo.tags.forEach((tag) => allTags.add(tag)));

  const noteSuggestions = Array.from(
    new Set([...notes.map((note) => note.title), ...todos.map((todo) => todo.title)]),
  ).sort();

  return {
    roomSuggestions: Array.from(allRooms).sort(),
    tagSuggestions: Array.from(allTags).sort(),
    noteSuggestions,
  };
}

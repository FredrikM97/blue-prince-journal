import type { Note, NoteType, Todo } from "@/lib/types";
import { matchesSearchQuery, parseSearchQuery } from "@/lib/searchQuery";
import { mapTodosToVirtualNotes } from "@/domain/todoVirtualNotes";

export function buildNoteListItems(notes: Note[], todos: Todo[]): Note[] {
  return [...notes, ...mapTodosToVirtualNotes(todos)].sort((a, b) => b.updatedAt - a.updatedAt);
}

export function buildRooms(items: Note[]): string[] {
  const set = new Set<string>();
  items.forEach((note) => note.room && set.add(note.room));
  return Array.from(set).sort();
}

export function buildTags(items: Note[]): string[] {
  const set = new Set<string>();
  items.forEach((note) => note.tags.forEach((tag) => set.add(tag)));
  return Array.from(set).sort();
}

export function parseTagInput(value: string): string[] {
  return value
    .split(/[\s,]+/)
    .map((token) => token.replace(/^#/, "").trim().toLowerCase())
    .filter(Boolean);
}

export function filterNotesList({
  noteListItems,
  search,
  filterType,
  roomFilters,
  tagFilter,
  statusFilter,
}: {
  noteListItems: Note[];
  search: string;
  filterType?: NoteType;
  roomFilters: string[];
  tagFilter: string | null;
  statusFilter: "open" | "solved" | null;
}): Note[] {
  const query = parseSearchQuery(search);
  return noteListItems.filter((note) => {
    if (filterType && note.type !== filterType) return false;
    if (roomFilters.length > 0 && !roomFilters.includes(note.room ?? "")) return false;
    if (tagFilter && !note.tags.includes(tagFilter)) return false;
    if (statusFilter && note.status !== statusFilter) return false;
    if (!matchesSearchQuery(note, query)) return false;
    return true;
  });
}

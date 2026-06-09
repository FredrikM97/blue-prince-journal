import { useMemo } from "react";
import type { Note, NoteType, Todo } from "@/lib/types";
import {
  buildNoteListItems,
  buildRooms,
  buildTags,
  filterNotesList,
} from "@/domain/notesPage";

export function useNotesPageData({
  notes,
  todos,
  search,
  filterType,
  roomFilters,
  tagFilter,
  statusFilter,
}: {
  notes: Note[];
  todos: Todo[];
  search: string;
  filterType?: NoteType;
  roomFilters: string[];
  tagFilter: string | null;
  statusFilter: "open" | "solved" | null;
}) {
  const noteListItems = useMemo(() => {
    return buildNoteListItems(notes, todos);
  }, [notes, todos]);

  const rooms = useMemo(() => buildRooms(noteListItems), [noteListItems]);

  const tags = useMemo(() => buildTags(noteListItems), [noteListItems]);

  const filtered = useMemo(() => {
    return filterNotesList({
      noteListItems,
      search,
      filterType,
      roomFilters,
      tagFilter,
      statusFilter,
    });
  }, [noteListItems, filterType, roomFilters, tagFilter, statusFilter, search]);

  return { filtered, rooms, tags, noteListItems };
}

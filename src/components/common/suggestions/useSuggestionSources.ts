import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/db";
import { getRoomCatalog } from "@/data/rooms/rooms";
import type { Note, Todo, GridCell } from "@/lib/types";
import { buildSuggestionSources, type SuggestionSources } from "@/domain/suggestions";

/**
 * Reads room and tag suggestions from the full app state (notes, todos, map rooms, catalog).
 * Memoized - only recomputes when underlying data changes.
 */
export function useSuggestionSources(): SuggestionSources {
  const liveNotes = useLiveQuery(() => db.notes.toArray());
  const liveTodos = useLiveQuery(() => db.todos.toArray());
  const liveGridCells = useLiveQuery(() => db.grid.toArray());

  const notes: Note[] = useMemo(() => liveNotes ?? [], [liveNotes]);
  const todos: Todo[] = useMemo(() => liveTodos ?? [], [liveTodos]);
  const gridCells: GridCell[] = useMemo(() => liveGridCells ?? [], [liveGridCells]);
  const roomCatalog = useMemo(() => getRoomCatalog().map((room) => room.name), []);

  return useMemo(
    () =>
      buildSuggestionSources({
        roomCatalog,
        notes,
        todos,
        gridCells,
      }),
    [gridCells, notes, roomCatalog, todos],
  );
}

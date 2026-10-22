import { useLiveQuery } from "dexie-react-hooks";
import { useMemo } from "react";
import { db } from "@/data/db";
import { getRoomCatalog } from "@/data/rooms/rooms";
import { buildSuggestionSources, type SuggestionSources } from "@/domain/suggestions";
import type { GridCell, Note, Todo } from "@/lib/types";

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

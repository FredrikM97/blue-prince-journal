import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { db } from "@/data/db";
import type { GridCell, Note, SectionDef, StoredImage, Todo } from "@/lib/types";
import { useLiveQueryArrayState } from "@/hooks/useLiveQueryArray";
import { buildGraph, toGraphEntries, type GraphModel } from "@/domain/graph";

type AppDataContextValue = {
  notes: Note[];
  todos: Todo[];
  images: StoredImage[];
  gridCells: GridCell[];
  sections: SectionDef[];
  graphEntries: Note[];
  graphModel: GraphModel;
  notesLoading: boolean;
  todosLoading: boolean;
  imagesLoading: boolean;
  gridCellsLoading: boolean;
  sectionsLoading: boolean;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

type AppHydratedSnapshot = {
  notes: Note[];
  todos: Todo[];
  images: StoredImage[];
  gridCells: GridCell[];
  sections: SectionDef[];
};

// Snapshot fetched during route preloading — available synchronously at provider mount
let preloadedSnapshot: AppHydratedSnapshot | null = null;

// Called during route preload phase so data is ready before the app renders.
// Fetches only the first 50 notes/todos for speed; live queries load the full dataset in background.
export async function fetchAppSnapshot(): Promise<void> {
  const [notes, todos, images, gridCells, sections] = await Promise.all([
    db.notes.orderBy("updatedAt").reverse().limit(50).toArray(),
    db.todos.orderBy("updatedAt").reverse().limit(50).toArray(),
    db.images.toArray(),
    db.grid.toArray(),
    db.sections.toArray(),
  ]);
  preloadedSnapshot = { notes, todos, images, gridCells, sections };
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  // preloadedSnapshot is set before this component mounts (during route preload),
  // so live queries start with real data as their default — no blank flash.
  const snapshot = preloadedSnapshot;

  const queryNotes = useCallback(() => db.notes.orderBy("updatedAt").reverse().toArray(), []);
  const queryTodos = useCallback(() => db.todos.orderBy("updatedAt").reverse().toArray(), []);
  const queryImages = useCallback(() => db.images.toArray(), []);
  const queryGridCells = useCallback(() => db.grid.toArray(), []);
  const querySections = useCallback(() => db.sections.toArray(), []);

  const notesState = useLiveQueryArrayState(queryNotes, { initialData: snapshot?.notes ?? [] });
  const todosState = useLiveQueryArrayState(queryTodos, { initialData: snapshot?.todos ?? [] });
  const imagesState = useLiveQueryArrayState(queryImages, { initialData: snapshot?.images ?? [] });
  const gridCellsState = useLiveQueryArrayState(queryGridCells, { initialData: snapshot?.gridCells ?? [] });
  const sectionsState = useLiveQueryArrayState(querySections, { initialData: snapshot?.sections ?? [] });

  const graphEntries = useMemo(
    () => toGraphEntries(notesState.data, todosState.data),
    [notesState.data, todosState.data],
  );
  const graphModel = useMemo(() => buildGraph(graphEntries), [graphEntries]);

  const value = useMemo(
    () => ({
      notes: notesState.data,
      todos: todosState.data,
      images: imagesState.data,
      gridCells: gridCellsState.data,
      sections: sectionsState.data,
      graphEntries,
      graphModel,
      notesLoading: notesState.isLoading,
      todosLoading: todosState.isLoading,
      imagesLoading: imagesState.isLoading,
      gridCellsLoading: gridCellsState.isLoading,
      sectionsLoading: sectionsState.isLoading,
    }),
    [graphEntries, graphModel, gridCellsState, imagesState, notesState, sectionsState, todosState],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
}
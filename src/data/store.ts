import { create } from "zustand";
import type { NoteType, Note, Todo, Priority } from "@/lib/types";

interface UIState {
  loaded: boolean;
  search: string;
  captureOpen: boolean;
  captureDefault: "note" | "todo";
  capturePrefill: string;
  capturePrefillRoom?: string;
  capturePrefillBody: string;
  capturePrefillImageIds: string[];
  capturePrefillTags: string;
  capturePrefillType?: NoteType;
  capturePrefillPriority?: Priority;
  captureEditNoteId?: string;
  captureEditTodoId?: string;
  captureReturnTo?: string;

  syncFolderName: string | null;
  setSyncFolderName: (name: string | null) => void;

  steamFolderName: string | null;
  setSteamFolderName: (name: string | null) => void;

  setLoaded: (loaded: boolean) => void;
  setSearch: (q: string) => void;
  openCapture: (opts?: {
    kind?: "note" | "todo";
    prefill?: string;
    room?: string;
    noteType?: NoteType;
    note?: Note;
    todo?: Todo;
    returnTo?: string;
  }) => void;
  closeCapture: () => void;
}

export const useStore = create<UIState>((set) => ({
  loaded: false,
  search: "",
  syncFolderName: null,
  steamFolderName: null,
  captureOpen: false,
  captureDefault: "note",
  capturePrefill: "",
  capturePrefillRoom: undefined,
  capturePrefillBody: "",
  capturePrefillImageIds: [],
  capturePrefillTags: "",
  capturePrefillType: undefined,
  capturePrefillPriority: undefined,
  captureEditNoteId: undefined,
  captureEditTodoId: undefined,
  captureReturnTo: undefined,

  setLoaded: (loaded) => set({ loaded }),
  setSyncFolderName: (name) => set({ syncFolderName: name }),
  setSteamFolderName: (name) => set({ steamFolderName: name }),
  setSearch: (q) => set({ search: q }),

  openCapture: (opts) => {
    const note = opts?.note;
    const todo = opts?.todo;

    if (note) {
      set({
        captureOpen: true,
        captureDefault: "note",
        capturePrefill: note.title,
        capturePrefillRoom: note.room,
        capturePrefillBody: note.body,
        capturePrefillImageIds: note.imageIds,
        capturePrefillTags: note.tags.join(", "),
        capturePrefillType: note.type,
        capturePrefillPriority: undefined,
        captureEditNoteId: note.id,
        captureEditTodoId: undefined,
        captureReturnTo: opts?.returnTo,
      });
      return;
    }

    if (todo) {
      set({
        captureOpen: true,
        captureDefault: "todo",
        capturePrefill: todo.title,
        capturePrefillRoom: todo.room,
        capturePrefillBody: todo.body ?? "",
        capturePrefillImageIds: todo.imageIds ?? [],
        capturePrefillTags: todo.tags.join(", "),
        capturePrefillType: undefined,
        capturePrefillPriority: todo.priority,
        captureEditNoteId: undefined,
        captureEditTodoId: todo.id,
        captureReturnTo: opts?.returnTo,
      });
      return;
    }

    set({
      captureOpen: true,
      captureDefault: opts?.kind ?? "note",
      capturePrefill: opts?.prefill ?? "",
      capturePrefillRoom: opts?.room,
      capturePrefillBody: "",
      capturePrefillImageIds: [],
      capturePrefillTags: "",
      capturePrefillType: opts?.noteType,
      capturePrefillPriority: undefined,
      captureEditNoteId: undefined,
      captureEditTodoId: undefined,
      captureReturnTo: opts?.returnTo,
    });
  },

  closeCapture: () =>
    set({
      captureOpen: false,
      capturePrefill: "",
      capturePrefillRoom: undefined,
      capturePrefillBody: "",
      capturePrefillImageIds: [],
      capturePrefillTags: "",
      capturePrefillType: undefined,
      capturePrefillPriority: undefined,
      captureEditNoteId: undefined,
      captureEditTodoId: undefined,
      captureReturnTo: undefined,
    }),
}));

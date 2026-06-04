import { nanoid } from "nanoid";
import { db } from "./db";
import { syncRuntime } from "./sync";
import { buildUniqueFileName } from "./imageNames";
import { cellId, clearCustomRooms } from "./rooms";
import { parseCapture } from "@/lib/parse";
import { clearAllData } from "./db";
import type {
  Note,
  Todo,
  StoredImage,
  RoomState,
  GridCell,
  NoteType,
  NoteStatus,
  TodoStatus,
  TodoScope,
  RunScope,
  Priority,
} from "@/lib/types";

export async function createFromCapture(
  raw: string,
  opts?: {
    kind?: "note" | "todo";
    imageIds?: string[];
    imageBlobs?: Blob[];
    body?: string;
    type?: NoteType;
    date?: string;
    room?: string;
    tags?: string[];
    priority?: Priority;
  },
): Promise<{ noteId?: string; todoId?: string }> {
  const parsed = parseCapture(raw);
  const kind = opts?.kind ?? (parsed.isTodo ? "todo" : "note");
  const now = Date.now();
  const imageIds: string[] = [...(opts?.imageIds ?? [])];

  if (opts?.imageBlobs?.length) {
    for (const b of opts.imageBlobs) {
      const img = await addImage(b);
      imageIds.push(img.id);
    }
  }

  const room = opts?.room ?? parsed.room;
  const tags = Array.from(new Set([...(opts?.tags ?? []), ...parsed.tags]));

  if (kind === "todo") {
    const todo: Todo = {
      id: nanoid(),
      title: parsed.title,
      imageIds,
      room,
      tags,
      status: parsed.status === "solved" ? "done" : "open",
      priority: opts?.priority ?? parsed.priority ?? "med",
      scope: (parsed.scope === "this-run" ? "this-run" : "cross-run") as TodoScope,
      body: opts?.body?.trim() || undefined,
      linkedNoteIds: [],
      createdAt: now,
      updatedAt: now,
      completedAt: parsed.status === "solved" ? now : undefined,
    };
    await db.todos.put(todo);
    syncRuntime.scheduleWrite();
    return { todoId: todo.id };
  }

  const note: Note = {
    id: nanoid(),
    type: opts?.type ?? parsed.type,
    title: parsed.title,
    body: opts?.body?.trim() ?? "",
    room,
    tags,
    date: opts?.date?.trim() || parsed.date,
    status: parsed.status as NoteStatus,
    scope: parsed.scope as RunScope,
    imageIds,
    createdAt: now,
    updatedAt: now,
  };
  await db.notes.put(note);
  syncRuntime.scheduleWrite();
  return { noteId: note.id };
}

export async function saveNote(n: Note): Promise<void> {
  const updated = { ...n, updatedAt: Date.now() };
  await db.notes.put(updated);
  syncRuntime.scheduleWrite();
}

export async function saveTodo(t: Todo): Promise<void> {
  const updated = { ...t, updatedAt: Date.now() };
  await db.todos.put(updated);
  syncRuntime.scheduleWrite();
}

export async function removeNote(id: string): Promise<void> {
  await db.notes.delete(id);
  syncRuntime.scheduleWrite();
}

export async function removeTodo(id: string): Promise<void> {
  await db.todos.delete(id);
  syncRuntime.scheduleWrite();
}

export async function toggleTodoStatus(id: string, status: TodoStatus): Promise<void> {
  const t = await db.todos.get(id);
  if (!t) return;
  const next: Todo = {
    ...t,
    status,
    completedAt: status === "done" ? Date.now() : undefined,
    updatedAt: Date.now(),
  };
  await db.todos.put(next);
  syncRuntime.scheduleWrite();
}

export async function addImage(blob: Blob, name?: string, caption?: string): Promise<StoredImage> {
  const sourceName = name ?? (blob instanceof File ? blob.name : undefined);
  const mimeExt = blob.type?.startsWith("image/") ? blob.type.split("/")[1] : "png";
  const existingNames = (await db.images.toArray()).map((i) => i.name);
  const uniqueName = buildUniqueFileName(existingNames, sourceName, "image", mimeExt);
  const img: StoredImage = {
    id: nanoid(),
    name: uniqueName,
    caption: caption?.trim() || uniqueName,
    tags: [],
    mime: blob.type || "image/png",
    blob,
    createdAt: Date.now(),
  };
  await db.images.put(img);
  syncRuntime.scheduleWrite();
  return img;
}

export async function updateImage(img: StoredImage): Promise<void> {
  await db.images.put(img);
  syncRuntime.scheduleWrite();
}

export async function removeImage(id: string): Promise<void> {
  await db.images.delete(id);
  syncRuntime.scheduleWrite();
}

export async function setRoomStatus(name: string, status: RoomState["status"]): Promise<void> {
  const r: RoomState = { name, status, updatedAt: Date.now() };
  await db.rooms.put(r);
  syncRuntime.scheduleWrite();
}

export async function addSection(label: string): Promise<void> {
  const sections = await db.sections.toArray();
  const s: import("@/lib/types").SectionDef = { id: nanoid(), label, order: sections.length };
  await db.sections.put(s);
  syncRuntime.scheduleWrite();
}

export async function removeSection(id: string): Promise<void> {
  await db.sections.delete(id);
  syncRuntime.scheduleWrite();
}

export async function upsertCell(
  patch: Partial<GridCell> & { row: number; col: number },
): Promise<void> {
  const id = cellId(patch.row, patch.col);
  const existing = await db.grid.get(id);
  const next: GridCell = {
    id,
    row: patch.row,
    col: patch.col,
    roomName: patch.roomName ?? existing?.roomName,
    comment: patch.comment ?? existing?.comment,
    status: patch.status ?? existing?.status ?? "unknown",
    updatedAt: Date.now(),
  };
  await db.grid.put(next);
  syncRuntime.scheduleWrite();
}

export async function clearCell(row: number, col: number): Promise<void> {
  const id = cellId(row, col);
  await db.grid.delete(id);
  syncRuntime.scheduleWrite();
}

export async function startFresh(): Promise<void> {
  if (typeof window === "undefined") return;
  await syncRuntime.disconnect();
  await clearAllData();
  clearCustomRooms();
  await import("./db").then(({ ensureBootSeed }) => ensureBootSeed());
}

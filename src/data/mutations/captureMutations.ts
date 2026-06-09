import { nanoid } from "nanoid";
import { db } from "../db";
import { syncRuntime } from "../sync/sync";
import { addImage } from "./imageMutations";
import { parseCapture } from "@/lib/parse";
import type {
  Note,
  Todo,
  NoteType,
  NoteStatus,
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

import { nanoid } from "nanoid";
import { db } from "../db";
import { syncRuntime } from "../sync/sync";
import { buildUniqueFileName } from "../imageNames";
import type { StoredImage, Note, Todo } from "@/lib/types";

export async function addImage(blob: Blob, name?: string, caption?: string): Promise<StoredImage> {
  const existingImages = await db.images.toArray();

  const sourceName = name ?? (blob instanceof File ? blob.name : undefined);
  const mimeExt = blob.type?.startsWith("image/") ? blob.type.split("/")[1] : "png";
  const existingNames = existingImages.map((i) => i.name);
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

export async function cleanupOrphanedImageRefs(): Promise<void> {
  const existingIds = new Set((await db.images.toArray()).map((img) => img.id));
  const [notes, todos] = await Promise.all([db.notes.toArray(), db.todos.toArray()]);

  const updatedNotes: Note[] = notes
    .filter((n) => n.imageIds.some((id) => !existingIds.has(id)))
    .map((n) => ({ ...n, imageIds: n.imageIds.filter((id) => existingIds.has(id)) }));

  const updatedTodos: Todo[] = todos
    .filter((t) => (t.imageIds ?? []).some((id) => !existingIds.has(id)))
    .map((t) => ({ ...t, imageIds: (t.imageIds ?? []).filter((id) => existingIds.has(id)) }));

  if (updatedNotes.length === 0 && updatedTodos.length === 0) return;

  await Promise.all([db.notes.bulkPut(updatedNotes), db.todos.bulkPut(updatedTodos)]);
  syncRuntime.scheduleWrite();
}

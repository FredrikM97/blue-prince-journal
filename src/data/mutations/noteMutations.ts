import { db } from "../db";
import { syncRuntime } from "../sync/sync";
import type { Note } from "@/lib/types";

export async function saveNote(n: Note): Promise<void> {
  const updated = { ...n, updatedAt: Date.now() };
  await db.notes.put(updated);
  syncRuntime.scheduleWrite();
}

export async function removeNote(id: string): Promise<void> {
  await db.notes.delete(id);
  syncRuntime.scheduleWrite();
}

export async function hideNote(id: string): Promise<void> {
  await db.notes.update(id, { hidden: true, updatedAt: Date.now() });
  syncRuntime.scheduleWrite();
}

export async function unhideNote(id: string): Promise<void> {
  await db.notes.update(id, { hidden: false, updatedAt: Date.now() });
  syncRuntime.scheduleWrite();
}
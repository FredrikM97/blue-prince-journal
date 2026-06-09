import { db } from "@/data/db";

export async function getLocalJournalItemCount(): Promise<number> {
  const [noteCount, todoCount, imageCount] = await Promise.all([
    db.notes.count(),
    db.todos.count(),
    db.images.count(),
  ]);
  return noteCount + todoCount + imageCount;
}

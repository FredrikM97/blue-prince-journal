import { db } from "../db";
import { syncRuntime } from "../sync/sync";
import type { Todo, TodoStatus } from "@/lib/types";

export async function saveTodo(t: Todo): Promise<void> {
  const updated = { ...t, updatedAt: Date.now() };
  await db.todos.put(updated);
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
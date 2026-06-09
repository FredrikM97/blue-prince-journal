import type { Note, Todo } from "@/lib/types";

export function mapTodosToVirtualNotes(todos: Todo[]): Note[] {
  return todos.map((todo) => ({
    id: `todo:${todo.id}`,
    type: "task",
    title: todo.title,
    body: todo.body ?? "",
    room: todo.room,
    tags: todo.tags,
    date: undefined,
    status: todo.status === "done" ? "solved" : "open",
    scope: todo.scope === "someday" ? "cross-run" : todo.scope,
    imageIds: todo.imageIds ?? [],
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
  }));
}

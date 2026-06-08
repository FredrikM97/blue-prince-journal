import type { Todo } from "@/lib/types";

export type TodoPriorityChipVariant = "priority-high" | "priority-normal" | "priority-low";

export function getTodoPriorityChipVariant(priority: Todo["priority"]): TodoPriorityChipVariant {
  if (priority === "high") return "priority-high";
  if (priority === "low") return "priority-low";
  return "priority-normal";
}
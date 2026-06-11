import type { NoteType } from "@/lib/types";
import {
  BookOpen,
  Eye,
  Key,
  Lightbulb,
  ListTodo,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components -- shared metadata constants, not a React component module
export const NOTE_TYPE_ORDER: NoteType[] = [
  "observation",
  "clue",
  "code",
  "theory",
  "story",
  "task",
];

export const NOTE_TYPE_META: Record<
  NoteType,
  { label: string; pluralLabel: string; icon: LucideIcon }
> = {
  observation: { label: "Observation", pluralLabel: "Observations", icon: Eye },
  clue: { label: "Clue", pluralLabel: "Clues", icon: Lightbulb },
  code: { label: "Code", pluralLabel: "Codes", icon: Key },
  theory: { label: "Theory", pluralLabel: "Theories", icon: Sparkles },
  story: { label: "Story", pluralLabel: "Stories", icon: BookOpen },
  task: { label: "Todo", pluralLabel: "Todos", icon: ListTodo },
};

export const NOTE_TYPE_OPTIONS = NOTE_TYPE_ORDER.map((value) => ({
  value,
  label: NOTE_TYPE_META[value].label,
}));

/**
 * Formats a timestamp into a short relative string for note rows.
 */
// eslint-disable-next-line react-refresh/only-export-components -- shared utility used by row summaries
export function relTime(ts: number) {
  const delta = Date.now() - ts;
  if (delta < 60_000) return "just now";
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h`;
  return `${Math.floor(delta / 86_400_000)}d`;
}

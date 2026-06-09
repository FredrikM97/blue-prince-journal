import { nanoid } from "nanoid";
import { db } from "../db";
import { syncRuntime } from "../sync/sync";
import type { SectionDef } from "@/lib/types";

export async function addSection(label: string): Promise<void> {
  const sections = await db.sections.toArray();
  const s: SectionDef = { id: nanoid(), label, order: sections.length };
  await db.sections.put(s);
  syncRuntime.scheduleWrite();
}

export async function removeSection(id: string): Promise<void> {
  await db.sections.delete(id);
  syncRuntime.scheduleWrite();
}
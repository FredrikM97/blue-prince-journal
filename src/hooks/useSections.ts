import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/data/db";
import type { SectionDef } from "@/lib/types";

export function useSections(): SectionDef[] {
  const rawSections = useLiveQuery(() =>
    db.sections.toArray().then((items) => items.sort((a, b) => a.order - b.order)),
  );
  return useMemo(() => rawSections ?? [], [rawSections]);
}

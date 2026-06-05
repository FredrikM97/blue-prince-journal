import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";

export function useLiveQueryArray<T>(query: () => Promise<T[]> | T[]): T[] {
  const raw = useLiveQuery(query);
  return useMemo(() => raw ?? [], [raw]);
}

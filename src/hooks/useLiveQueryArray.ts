import { useMemo, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";

export function useLiveQueryArrayState<T>(
  query: () => Promise<T[]> | T[],
  options?: { initialData?: T[] },
) {
  // Pass initialData as Dexie's defaultResult — shown immediately while the live query runs.
  // Once the query resolves (even if it returns []), raw switches from undefined to the real array.
  const raw = useLiveQuery(query, [], options?.initialData);

  const lastDataRef = useRef<T[]>(options?.initialData ?? []);
  if (raw !== undefined) {
    lastDataRef.current = raw;
  }

  return useMemo(
    () => ({
      data: raw ?? lastDataRef.current,
      isLoading: raw === undefined,
    }),
    [raw],
  );
}

export function useLiveQueryArray<T>(query: () => Promise<T[]> | T[]): T[] {
  return useLiveQueryArrayState(query).data;
}

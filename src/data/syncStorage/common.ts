export function mergeById<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
  const next = new Map<string, T>();
  for (const item of existing) next.set(item.id, item);
  for (const item of incoming) next.set(item.id, item);
  return Array.from(next.values());
}

export function mergeByName<T extends { name: string }>(existing: T[], incoming: T[]): T[] {
  const next = new Map<string, T>();
  for (const item of existing) next.set(item.name, item);
  for (const item of incoming) next.set(item.name, item);
  return Array.from(next.values());
}

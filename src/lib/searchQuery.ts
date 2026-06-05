export interface ParsedSearchQuery {
  textIncludes: string[];
  textExcludes: string[];
  roomIncludes: string[];
  roomExcludes: string[];
  tagIncludes: string[];
  tagExcludes: string[];
  noteIncludes: string[];
  noteExcludes: string[];
}

export interface SearchMatchTarget {
  title: string;
  body?: string;
  room?: string;
  tags?: string[];
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeRoom(value: string): string {
  return value.trim().toLowerCase().replace(/[_-]+/g, " ").replace(/\s+/g, " ");
}

function normalizeTag(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeNoteSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function pushUnique(list: string[], value: string): void {
  if (!value) return;
  if (!list.includes(value)) list.push(value);
}

export function parseSearchQuery(rawQuery: string): ParsedSearchQuery {
  const parsed: ParsedSearchQuery = {
    textIncludes: [],
    textExcludes: [],
    roomIncludes: [],
    roomExcludes: [],
    tagIncludes: [],
    tagExcludes: [],
    noteIncludes: [],
    noteExcludes: [],
  };

  const tokens = rawQuery.trim().split(/\s+/);
  for (const rawToken of tokens) {
    if (!rawToken) continue;

    let token = rawToken;
    let isExclude = false;
    if (token.startsWith("-") && token.length > 1) {
      isExclude = true;
      token = token.slice(1);
    }

    if (!token) continue;

    const tokenValue = token.slice(1);
    if (token.startsWith("@") && tokenValue) {
      const normalized = normalizeRoom(tokenValue);
      if (isExclude) pushUnique(parsed.roomExcludes, normalized);
      if (!isExclude) pushUnique(parsed.roomIncludes, normalized);
      continue;
    }

    if (token.startsWith("#") && tokenValue) {
      const normalized = normalizeTag(tokenValue);
      if (isExclude) pushUnique(parsed.tagExcludes, normalized);
      if (!isExclude) pushUnique(parsed.tagIncludes, normalized);
      continue;
    }

    if (token.startsWith("^") && tokenValue) {
      const normalized = normalizeNoteSlug(tokenValue);
      if (isExclude) pushUnique(parsed.noteExcludes, normalized);
      if (!isExclude) pushUnique(parsed.noteIncludes, normalized);
      continue;
    }

    const normalizedText = normalizeText(token);
    if (isExclude) pushUnique(parsed.textExcludes, normalizedText);
    if (!isExclude) pushUnique(parsed.textIncludes, normalizedText);
  }

  return parsed;
}

export function matchesSearchQuery(target: SearchMatchTarget, query: ParsedSearchQuery): boolean {
  const room = normalizeRoom(target.room ?? "");
  const tags = (target.tags ?? []).map(normalizeTag);
  const titleSlug = normalizeNoteSlug(target.title);
  const haystack = [
    target.title,
    target.body ?? "",
    target.room ?? "",
    (target.tags ?? []).join(" "),
  ]
    .join(" ")
    .toLowerCase();

  for (const term of query.textIncludes) {
    if (!haystack.includes(term)) return false;
  }

  for (const term of query.textExcludes) {
    if (haystack.includes(term)) return false;
  }

  for (const token of query.roomIncludes) {
    if (!room.includes(token)) return false;
  }

  for (const token of query.roomExcludes) {
    if (room.includes(token)) return false;
  }

  for (const token of query.tagIncludes) {
    if (!tags.some((tag) => tag.includes(token))) return false;
  }

  for (const token of query.tagExcludes) {
    if (tags.some((tag) => tag.includes(token))) return false;
  }

  for (const token of query.noteIncludes) {
    if (!titleSlug.includes(token)) return false;
  }

  for (const token of query.noteExcludes) {
    if (titleSlug.includes(token)) return false;
  }

  return true;
}

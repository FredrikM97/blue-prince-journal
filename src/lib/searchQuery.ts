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

  const tokens = rawQuery.match(/\S+/g);
  if (!tokens) return parsed;

  for (const rawToken of tokens) {
    let token = rawToken;
    let isExclude = false;
    if (token.startsWith("-") && token.length > 1) {
      isExclude = true;
      token = token.slice(1);
    }

    if (!token) continue;

    if (token.startsWith("@") && token.length > 1) {
      const normalized = normalizeRoom(token.slice(1));
      if (isExclude) pushUnique(parsed.roomExcludes, normalized);
      if (!isExclude) pushUnique(parsed.roomIncludes, normalized);
      continue;
    }

    if (token.startsWith("#") && token.length > 1) {
      const normalized = normalizeTag(token.slice(1));
      if (isExclude) pushUnique(parsed.tagExcludes, normalized);
      if (!isExclude) pushUnique(parsed.tagIncludes, normalized);
      continue;
    }

    if (token.startsWith("^") && token.length > 1) {
      const normalized = normalizeNoteSlug(token.slice(1));
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

// Query syntax supports substring matches across multiple fields (title/body/room/tags)
// plus include/exclude semantics for each token family. The current Dexie schema does
// not provide a single index strategy that can satisfy this mix efficiently in IndexedDB,
// so filtering remains in-memory after retrieval.
export function matchesSearchQuery(target: SearchMatchTarget, query: ParsedSearchQuery): boolean {
  if (query.roomIncludes.length > 0 || query.roomExcludes.length > 0) {
    const room = normalizeRoom(target.room ?? "");
    const roomChecks = Math.max(query.roomIncludes.length, query.roomExcludes.length);
    for (let i = 0; i < roomChecks; i += 1) {
      const includeToken = query.roomIncludes[i];
      if (includeToken && !room.includes(includeToken)) return false;
      const excludeToken = query.roomExcludes[i];
      if (excludeToken && room.includes(excludeToken)) return false;
    }
  }

  if (query.tagIncludes.length > 0 || query.tagExcludes.length > 0) {
    const tags = (target.tags ?? []).map(normalizeTag);
    const tagChecks = Math.max(query.tagIncludes.length, query.tagExcludes.length);
    for (let i = 0; i < tagChecks; i += 1) {
      const includeToken = query.tagIncludes[i];
      if (includeToken && !tags.some((tag) => tag.includes(includeToken))) return false;
      const excludeToken = query.tagExcludes[i];
      if (excludeToken && tags.some((tag) => tag.includes(excludeToken))) return false;
    }
  }

  if (query.noteIncludes.length > 0 || query.noteExcludes.length > 0) {
    const titleSlug = normalizeNoteSlug(target.title);
    const noteChecks = Math.max(query.noteIncludes.length, query.noteExcludes.length);
    for (let i = 0; i < noteChecks; i += 1) {
      const includeToken = query.noteIncludes[i];
      if (includeToken && !titleSlug.includes(includeToken)) return false;
      const excludeToken = query.noteExcludes[i];
      if (excludeToken && titleSlug.includes(excludeToken)) return false;
    }
  }

  if (query.textIncludes.length > 0 || query.textExcludes.length > 0) {
    const haystack = [
      target.title,
      target.body ?? "",
      target.room ?? "",
      (target.tags ?? []).join(" "),
    ]
      .join(" ")
      .toLowerCase();
    const textChecks = Math.max(query.textIncludes.length, query.textExcludes.length);
    for (let i = 0; i < textChecks; i += 1) {
      const includeTerm = query.textIncludes[i];
      if (includeTerm && !haystack.includes(includeTerm)) return false;
      const excludeTerm = query.textExcludes[i];
      if (excludeTerm && haystack.includes(excludeTerm)) return false;
    }
  }

  return true;
}

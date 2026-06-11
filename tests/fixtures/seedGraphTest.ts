/**
 * Dev utility: seeds the store with chunked test notes to verify graph layout.
 * Rooms are organised into 6 "wings" with heavy internal cross-referencing and
 * only 1-2 bridges between wings — this should produce visible cluster groups.
 * Wipe with Settings → Start Fresh when done.
 */
import { nanoid } from "nanoid";
import type { Note, NoteType, Priority, RunScope, Todo, TodoScope, TodoStatus } from "@/lib/types";

export interface SeedImageSpec {
  name: string;
  caption: string;
  blob: Blob;
}

// Each wing has a set of rooms, shared tags, and occasional bridge rooms that
// link it to another wing.
const WINGS: Array<{
  rooms: string[];
  tags: string[];
  types: NoteType[];
  bridge?: string; // one room in another wing to occasionally mention
}> = [
  {
    rooms: ["Kitchen", "Scullery", "Butler Pantry", "Laundry", "Coal Cellar", "Storage Room"],
    tags: ["servants", "supplies", "cooking", "fire"],
    types: ["observation", "clue"],
    bridge: "Cellar",
  },
  {
    rooms: ["Library", "Study", "Map Room", "Drawing Room", "Sitting Room", "Reading Nook"],
    tags: ["books", "knowledge", "papers", "hidden"],
    types: ["clue", "theory"],
    bridge: "Observatory",
  },
  {
    rooms: ["Armory", "Guard Room", "Barracks", "Trophy Room", "Dungeon", "Prison"],
    tags: ["weapons", "locked", "guards", "trap", "key"],
    types: ["clue", "observation"],
    bridge: "Underground Vault",
  },
  {
    rooms: ["Ballroom", "Music Room", "Gallery", "Portrait Gallery", "Great Hall", "Foyer"],
    tags: ["music", "art", "social", "portrait", "light"],
    types: ["story", "observation"],
    bridge: "Drawing Room",
  },
  {
    rooms: ["Observatory", "Laboratory", "Clock Room", "Workshop", "Bell Tower", "Attic"],
    tags: ["mechanism", "science", "clock", "hidden", "key"],
    types: ["theory", "code"],
    bridge: "Map Room",
  },
  {
    rooms: [
      "Chapel",
      "Crypt",
      "Antechamber",
      "Throne Room",
      "Hall of Mirrors",
      "Underground Vault",
      "Cellar",
    ],
    tags: ["sacred", "mystery", "ritual", "shadow", "passage"],
    types: ["theory", "story", "clue"],
    bridge: "Prison",
  },
];

const SCOPES: RunScope[] = ["this-run", "cross-run"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function sample<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}

function toRef(room: string) {
  return "@" + room.toLowerCase().replace(/\s+/g, "-");
}

export function buildGraphTestNotes(): Note[] {
  const notes: Note[] = [];
  const now = Date.now();

  for (const wing of WINGS) {
    for (const room of wing.rooms) {
      const count = 2 + Math.floor(Math.random() * 3); // 2-4 notes per room
      for (let i = 0; i < count; i++) {
        const type = pick(wing.types);
        const tags = sample(wing.tags, 1 + Math.floor(Math.random() * 2));

        // Mostly reference rooms in the same wing; rarely bridge to another wing
        const internalRef = Math.random() > 0.3 ? pick(wing.rooms.filter((r) => r !== room)) : null;
        const bridgeRef = wing.bridge && Math.random() > 0.8 ? wing.bridge : null;

        const body = [
          internalRef ? `Connected to ${toRef(internalRef)}.` : "",
          bridgeRef ? `Possible link to ${toRef(bridgeRef)}.` : "",
          "Needs further investigation.",
        ]
          .filter(Boolean)
          .join(" ");

        notes.push({
          id: nanoid(),
          type,
          title: `${room} ${i + 1}`,
          body,
          room,
          tags,
          status: Math.random() > 0.7 ? "solved" : "open",
          scope: pick(SCOPES),
          imageIds: [],
          createdAt: now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
          updatedAt: now,
        });
      }
    }
  }

  return notes;
}

function buildSeedSvg(index: number): string {
  const palettes = [
    ["#0F766E", "#14B8A6", "#99F6E4"],
    ["#1D4ED8", "#3B82F6", "#93C5FD"],
    ["#B45309", "#D97706", "#FCD34D"],
    ["#9F1239", "#E11D48", "#FDA4AF"],
    ["#3F6212", "#65A30D", "#BEF264"],
  ];
  const palette = palettes[index % palettes.length];
  const label = `Seed ${index + 1}`;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">',
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${palette[0]}"/><stop offset="60%" stop-color="${palette[1]}"/><stop offset="100%" stop-color="${palette[2]}"/></linearGradient></defs>`,
    '<rect width="1200" height="900" fill="url(#g)"/>',
    '<circle cx="960" cy="180" r="160" fill="rgba(255,255,255,0.18)"/>',
    '<circle cx="220" cy="720" r="200" fill="rgba(0,0,0,0.15)"/>',
    '<rect x="120" y="180" width="620" height="480" rx="28" fill="rgba(0,0,0,0.18)"/>',
    `<text x="170" y="300" fill="white" font-family="ui-sans-serif,system-ui" font-size="74" font-weight="700">${label}</text>`,
    '<text x="170" y="390" fill="rgba(255,255,255,0.9)" font-family="ui-sans-serif,system-ui" font-size="38">Generated test screenshot</text>',
    '<text x="170" y="452" fill="rgba(255,255,255,0.82)" font-family="ui-sans-serif,system-ui" font-size="30">Use for preview, gallery, and note attachment checks</text>',
    "</svg>",
  ].join("");
}

export function buildSeedTestImageSpecs(count = 70): SeedImageSpec[] {
  const specs: SeedImageSpec[] = [];
  for (let i = 0; i < count; i++) {
    const svg = buildSeedSvg(i);
    specs.push({
      name: `seed-image-${String(i + 1).padStart(2, "0")}.svg`,
      caption: `Seed image ${i + 1}`,
      blob: new Blob([svg], { type: "image/svg+xml" }),
    });
  }
  return specs;
}

export function attachSeedImagesToNotes(notes: Note[], imageIds: string[]): Note[] {
  if (imageIds.length === 0) return notes;

  return notes.map((note, index) => {
    const attached: string[] = [];
    if (index % 3 === 0) attached.push(imageIds[index % imageIds.length]);
    if (index % 7 === 0) attached.push(imageIds[(index + 3) % imageIds.length]);
    if (attached.length === 0) return note;

    return {
      ...note,
      imageIds: Array.from(new Set(attached)),
    };
  });
}

const TODO_SEEDS: Array<{
  title: string;
  body?: string;
  room: string;
  priority: Priority;
  status: TodoStatus;
  scope: TodoScope;
  tags: string[];
}> = [
  {
    title: "Search the Kitchen for hidden compartments",
    room: "Kitchen",
    priority: "high",
    status: "open",
    scope: "this-run",
    tags: ["search", "hidden"],
  },
  {
    title: "Inspect the coal cellar for a second exit",
    room: "Coal Cellar",
    priority: "med",
    status: "open",
    scope: "this-run",
    tags: ["search"],
  },
  {
    title: "Cross-reference the butler's log with pantry stock",
    room: "Butler Pantry",
    priority: "low",
    status: "done",
    scope: "cross-run",
    tags: ["papers", "supplies"],
  },
  {
    title: "Decode the cipher found in the Map Room",
    room: "Map Room",
    priority: "high",
    status: "in-progress",
    scope: "this-run",
    tags: ["code", "papers"],
  },
  {
    title: "Return the stolen book to the Library shelf",
    room: "Library",
    body: "Check the third row from the top near the window.",
    priority: "med",
    status: "open",
    scope: "cross-run",
    tags: ["books"],
  },
  {
    title: "Find the missing key to the Reading Nook cabinet",
    room: "Reading Nook",
    priority: "high",
    status: "open",
    scope: "this-run",
    tags: ["key", "locked"],
  },
  {
    title: "Inventory weapons in the Armory",
    room: "Armory",
    priority: "med",
    status: "done",
    scope: "this-run",
    tags: ["weapons"],
  },
  {
    title: "Inspect the Dungeon for recent footprints",
    room: "Dungeon",
    priority: "high",
    status: "open",
    scope: "this-run",
    tags: ["trap", "guards"],
  },
  {
    title: "Interview the trophy keeper",
    room: "Trophy Room",
    priority: "low",
    status: "open",
    scope: "someday",
    tags: ["guards"],
  },
  {
    title: "Look for a hidden passage behind the portrait",
    room: "Portrait Gallery",
    priority: "high",
    status: "in-progress",
    scope: "this-run",
    tags: ["portrait", "hidden"],
  },
  {
    title: "Trace the melody played in the Music Room",
    room: "Music Room",
    priority: "med",
    status: "open",
    scope: "cross-run",
    tags: ["music"],
  },
  {
    title: "Calibrate the Observatory telescope",
    room: "Observatory",
    priority: "low",
    status: "done",
    scope: "this-run",
    tags: ["science", "mechanism"],
  },
  {
    title: "Repair the Clock Room mechanism",
    room: "Clock Room",
    priority: "high",
    status: "open",
    scope: "this-run",
    tags: ["clock", "mechanism"],
  },
  {
    title: "Recover documents from the Underground Vault",
    room: "Underground Vault",
    priority: "high",
    status: "open",
    scope: "this-run",
    tags: ["passage", "locked"],
  },
  {
    title: "Translate the ritual text in the Chapel",
    room: "Chapel",
    priority: "med",
    status: "open",
    scope: "cross-run",
    tags: ["sacred", "ritual"],
  },
  {
    title: "Map the Crypt layout",
    room: "Crypt",
    priority: "med",
    status: "in-progress",
    scope: "this-run",
    tags: ["mystery", "passage"],
  },
  {
    title: "Identify the figure in the Hall of Mirrors",
    room: "Hall of Mirrors",
    priority: "low",
    status: "open",
    scope: "someday",
    tags: ["shadow", "mystery"],
  },
  {
    title: "Examine the Throne Room for pressure plates",
    room: "Throne Room",
    priority: "high",
    status: "open",
    scope: "this-run",
    tags: ["trap", "ritual"],
  },
  {
    title: "Check the Workshop for improvised devices",
    room: "Workshop",
    priority: "med",
    status: "open",
    scope: "this-run",
    tags: ["mechanism", "science"],
  },
  {
    title: "Record the Bell Tower strike pattern",
    room: "Bell Tower",
    priority: "low",
    status: "done",
    scope: "cross-run",
    tags: ["clock", "hidden"],
  },
];

const TODO_SCOPES: TodoScope[] = ["this-run", "cross-run", "someday"];

export function buildGraphTestTodos(notes: Note[]): Todo[] {
  const now = Date.now();
  const roomToNoteIds = new Map<string, string[]>();
  for (const note of notes) {
    if (!note.room) continue;
    if (!roomToNoteIds.has(note.room)) roomToNoteIds.set(note.room, []);
    roomToNoteIds.get(note.room)!.push(note.id);
  }

  return TODO_SEEDS.map((seed) => {
    const roomNotes = roomToNoteIds.get(seed.room) ?? [];
    // Link up to 2 notes from the same room
    const linkedNoteIds = roomNotes.slice(0, 2);
    const completedAt =
      seed.status === "done"
        ? now - Math.floor(Math.random() * 3 * 24 * 60 * 60 * 1000)
        : undefined;
    return {
      id: nanoid(),
      title: seed.title,
      body: seed.body,
      room: seed.room,
      tags: seed.tags,
      status: seed.status,
      priority: seed.priority,
      scope: pick(TODO_SCOPES),
      linkedNoteIds,
      createdAt: now - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: now,
      ...(completedAt !== undefined && { completedAt }),
    };
  });
}

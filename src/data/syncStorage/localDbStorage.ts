import { listCustomRooms, replaceCustomRooms } from "@/data/rooms";
import { readLocalStorageJson, writeLocalStorageJson } from "@/data/browserStorage";
import { mergeById, mergeByName } from "./common";
import type { StorageAdapter, AppDataSnapshot } from "./types";
import type { GridCell, Note, RoomState, SectionDef, StoredImage, Todo } from "@/lib/types";

const LOCAL_DB_KEY = "bp-local-db-v1";

interface LocalDbImageRecord {
  id: string;
  name: string;
  caption?: string;
  tags: string[];
  mime: string;
  dataUrl: string;
  createdAt: number;
}

interface LocalDbSnapshot {
  version: number;
  savedAt: number;
  notes: Note[];
  todos: Todo[];
  images: LocalDbImageRecord[];
  rooms: RoomState[];
  sections: SectionDef[];
  gridCells: GridCell[];
}

function readLocalDbSnapshot(): LocalDbSnapshot | null {
  const parsed = readLocalStorageJson<Partial<LocalDbSnapshot>>(LOCAL_DB_KEY);
  if (!parsed) return null;

  return {
    version: typeof parsed.version === "number" ? parsed.version : 1,
    savedAt: typeof parsed.savedAt === "number" ? parsed.savedAt : 0,
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    todos: Array.isArray(parsed.todos) ? parsed.todos : [],
    images: Array.isArray(parsed.images) ? parsed.images : [],
    rooms: Array.isArray(parsed.rooms) ? parsed.rooms : [],
    sections: Array.isArray(parsed.sections) ? parsed.sections : [],
    gridCells: Array.isArray(parsed.gridCells) ? parsed.gridCells : [],
  };
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("Could not convert blob to data URL"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Could not read blob"));
    reader.readAsDataURL(blob);
  });
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

export const localDbStorage: StorageAdapter = {
  async read() {
    const snapshot = readLocalDbSnapshot();
    const images = snapshot?.images ?? [];

    const hydratedImages: StoredImage[] = [];
    for (const image of images) {
      try {
        hydratedImages.push({
          id: image.id,
          name: image.name,
          caption: image.caption,
          tags: image.tags ?? [],
          mime: image.mime,
          blob: await dataUrlToBlob(image.dataUrl),
          createdAt: image.createdAt,
        });
      } catch {
        // Skip invalid image entries and continue with remaining local data.
      }
    }

    return {
      notes: snapshot?.notes ?? [],
      todos: snapshot?.todos ?? [],
      images: hydratedImages,
      rooms: snapshot?.rooms ?? [],
      sections: snapshot?.sections ?? [],
      gridCells: snapshot?.gridCells ?? [],
      customRooms: listCustomRooms().map((room) => ({ name: room.name, category: room.category })),
    };
  },

  async clear() {
    writeLocalStorageJson(LOCAL_DB_KEY, {
      version: 2,
      savedAt: Date.now(),
      notes: [],
      todos: [],
      images: [],
      rooms: [],
      sections: [],
      gridCells: [],
    });
    replaceCustomRooms([]);
  },

  async write(data: AppDataSnapshot) {
    const existing = readLocalDbSnapshot();

    // Reuse already-serialized dataUrls for unchanged images (same id = same blob).
    const existingDataUrls = new Map((existing?.images ?? []).map((img) => [img.id, img.dataUrl]));

    const serializedImages = await Promise.all(
      data.images.map(async (image) => ({
        id: image.id,
        name: image.name,
        caption: image.caption,
        tags: image.tags,
        mime: image.mime,
        dataUrl: existingDataUrls.get(image.id) ?? (await blobToDataUrl(image.blob)),
        createdAt: image.createdAt,
      })),
    );

    if (!existing) {
      // No existing data — write incoming directly.
      writeLocalStorageJson(LOCAL_DB_KEY, {
        version: 2,
        savedAt: Date.now(),
        notes: data.notes,
        todos: data.todos,
        images: serializedImages,
        rooms: data.rooms,
        sections: data.sections,
        gridCells: data.gridCells,
      });
      replaceCustomRooms(data.customRooms);
      return;
    }

    // Merge into existing.
    writeLocalStorageJson(LOCAL_DB_KEY, {
      version: 2,
      savedAt: Date.now(),
      notes: mergeById(existing.notes, data.notes),
      todos: mergeById(existing.todos, data.todos),
      images: mergeById(existing.images, serializedImages),
      rooms: mergeByName(existing.rooms, data.rooms),
      sections: mergeById(existing.sections, data.sections),
      gridCells: mergeById(existing.gridCells, data.gridCells),
    });

    if (data.customRooms.length > 0) {
      const existingRooms = listCustomRooms().map((r) => ({ name: r.name, category: r.category }));
      replaceCustomRooms(mergeByName(existingRooms, data.customRooms));
    }
  },
};

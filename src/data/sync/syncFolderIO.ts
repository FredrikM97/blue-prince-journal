import { buildUniqueFileName } from "../imageNames";
import type { RoomCategory } from "../rooms/rooms";
import type { StoredImage } from "@/lib/types";
import type { AppDataSnapshot } from "../db";
import type { FsDirectoryHandle as DirHandle } from "./fileAccessTypes";

const MANIFEST_FILE = "manifest.json";
const IMAGES_DIR = "images";

type FolderImageRef = Omit<StoredImage, "blob"> & { fileName: string };

interface FolderManifest {
  app: "blue-prince-notes";
  syncVersion: 1;
  syncedAt: number;
  notes: AppDataSnapshot["notes"];
  todos: AppDataSnapshot["todos"];
  images: FolderImageRef[];
  rooms: AppDataSnapshot["rooms"];
  sections: AppDataSnapshot["sections"];
  gridCells: AppDataSnapshot["gridCells"];
  customRooms: Array<{ name: string; category: RoomCategory }>;
}

export async function readFolder(handle: DirHandle): Promise<AppDataSnapshot | null> {
  try {
    const fh = await handle.getFileHandle(MANIFEST_FILE, { create: false });
    const manifest = JSON.parse(await (await fh.getFile()).text()) as FolderManifest;
    if (manifest.app !== "blue-prince-notes") return null;

    let imagesDir: DirHandle | null = null;
    try {
      imagesDir = await handle.getDirectoryHandle(IMAGES_DIR, { create: false });
    } catch {
      imagesDir = null;
    }

    const images: StoredImage[] = [];
    if (imagesDir) {
      for (const img of manifest.images ?? []) {
        try {
          const imageFile = await imagesDir.getFileHandle(img.fileName, { create: false });
          const buffer = await (await imageFile.getFile()).arrayBuffer();
          images.push({
            id: img.id,
            name: img.name,
            caption: img.caption,
            tags: img.tags ?? [],
            mime: img.mime,
            blob: new Blob([buffer], { type: img.mime }),
            createdAt: img.createdAt,
          });
        } catch {
          // Skip missing / corrupt image files and continue.
        }
      }
    }

    return {
      notes: manifest.notes ?? [],
      todos: manifest.todos ?? [],
      images,
      rooms: manifest.rooms ?? [],
      sections: manifest.sections ?? [],
      gridCells: manifest.gridCells ?? [],
      customRooms: manifest.customRooms ?? [],
    };
  } catch {
    return null;
  }
}

export async function writeFolder(handle: DirHandle, data: AppDataSnapshot): Promise<void> {
  const imagesDir = await handle.getDirectoryHandle(IMAGES_DIR, { create: true });
  const usedFileNames: string[] = [];
  const imageRefs: FolderImageRef[] = [];

  for (const image of data.images) {
    const fileName = buildUniqueFileName(usedFileNames, image.name, image.id, "png");
    usedFileNames.push(fileName);

    let alreadyOnDisk = false;
    try {
      await imagesDir.getFileHandle(fileName, { create: false });
      alreadyOnDisk = true;
    } catch {
      // File not found — needs writing.
    }

    if (!alreadyOnDisk) {
      const imageFile = await imagesDir.getFileHandle(fileName, { create: true });
      const writable = await imageFile.createWritable();
      await writable.write(image.blob);
      await writable.close();
    }

    imageRefs.push({
      id: image.id,
      name: image.name,
      caption: image.caption,
      tags: image.tags,
      mime: image.mime,
      createdAt: image.createdAt,
      fileName,
    });
  }

  if (imagesDir.values && imagesDir.removeEntry) {
    const keep = new Set(usedFileNames);
    for await (const entry of imagesDir.values()) {
      if (entry.kind !== "file") continue;
      if (keep.has(entry.name)) continue;
      try {
        await imagesDir.removeEntry(entry.name);
      } catch {
        // Ignore remove failures so manifest writes still proceed.
      }
    }
  }

  const manifest: FolderManifest = {
    app: "blue-prince-notes",
    syncVersion: 1,
    syncedAt: Date.now(),
    notes: data.notes,
    todos: data.todos,
    images: imageRefs,
    rooms: data.rooms,
    sections: data.sections,
    gridCells: data.gridCells,
    customRooms: data.customRooms,
  };

  const fh = await handle.getFileHandle(MANIFEST_FILE, { create: true });
  const writable = await fh.createWritable();
  await writable.write(JSON.stringify(manifest, null, 2));
  await writable.close();
}

// ZIP-first export/import. Keeps images as binary files for better performance.
import { db } from "../db";
import type { Note, Todo, StoredImage, RoomState, SectionDef, GridCell } from "@/lib/types";
import { listCustomRooms, replaceCustomRooms, type RoomCategory } from "../rooms/rooms";

type JSZipCtor = typeof import("jszip") extends { default: infer T } ? T : typeof import("jszip");

let jsZipCtorPromise: Promise<JSZipCtor> | null = null;

async function getJSZipCtor() {
  if (!jsZipCtorPromise) {
    jsZipCtorPromise = import("jszip").then((m) => ("default" in m ? m.default : m) as JSZipCtor);
  }
  return jsZipCtorPromise;
}

interface LegacyJsonExportFile {
  app: "blue-prince-notes";
  version: 2;
  exportedAt: number;
  notes: Note[];
  todos: Todo[];
  images: Array<Omit<StoredImage, "blob"> & { dataUrl: string }>;
  rooms: RoomState[];
  sections: SectionDef[];
  gridCells?: GridCell[];
}

interface ZipExportImageMeta extends Omit<StoredImage, "blob"> {
  file: string;
}

interface ZipExportManifest {
  app: "blue-prince-notes";
  version: 4;
  exportedAt: number;
  notes: Note[];
  todos: Todo[];
  images: ZipExportImageMeta[];
  rooms: RoomState[];
  sections: SectionDef[];
  gridCells?: GridCell[];
  customRooms?: Array<{ name: string; category: RoomCategory }>;
}

type BackupExportSnapshot = {
  notes: Note[];
  todos: Todo[];
  images: StoredImage[];
  rooms: RoomState[];
  sections: SectionDef[];
  gridCells: GridCell[];
  customRooms: Array<{ name: string; category: RoomCategory }>;
};

type BackupZipBuildResult = {
  manifest: ZipExportManifest;
  imageFiles: Array<{ path: string; blob: Blob }>;
};

function buildBackupZipContent(
  snapshot: BackupExportSnapshot,
  exportedAt: number,
): BackupZipBuildResult {
  const manifestImages: ZipExportImageMeta[] = [];
  const imageFiles: Array<{ path: string; blob: Blob }> = [];

  for (const image of snapshot.images) {
    const path = `images/${image.id}`;
    manifestImages.push({
      id: image.id,
      name: image.name,
      caption: image.caption,
      tags: image.tags,
      mime: image.mime,
      createdAt: image.createdAt,
      file: path,
    });
    imageFiles.push({ path, blob: image.blob });
  }

  return {
    manifest: {
      app: "blue-prince-notes",
      version: 4,
      exportedAt,
      notes: snapshot.notes,
      todos: snapshot.todos,
      images: manifestImages,
      rooms: snapshot.rooms,
      sections: snapshot.sections,
      gridCells: snapshot.gridCells,
      customRooms: snapshot.customRooms,
    },
    imageFiles,
  };
}

async function dataUrlToBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  return res.blob();
}

export async function exportAll(): Promise<void> {
  const JSZip = await getJSZipCtor();
  const [notes, todos, images, rooms, sections, gridCells] = await Promise.all([
    db.notes.orderBy("updatedAt").reverse().toArray(),
    db.todos.orderBy("updatedAt").reverse().toArray(),
    db.images.toArray(),
    db.rooms.toArray(),
    db.sections.toArray(),
    db.grid.toArray(),
  ]);
  const customRooms = listCustomRooms().map((room) => ({
    name: room.name,
    category: room.category,
  }));

  const { manifest, imageFiles } = buildBackupZipContent(
    { notes, todos, images, rooms, sections, gridCells, customRooms },
    Date.now(),
  );

  const zip = new JSZip();
  for (const file of imageFiles) {
    zip.file(file.path, file.blob);
  }

  zip.file("manifest.json", JSON.stringify(manifest, null, 2));
  const blob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `blue-prince-notes-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}

async function clearForReplaceMode() {
  await Promise.all([db.notes.clear(), db.todos.clear(), db.images.clear()]);
}

async function importFromLegacyJson(file: File, mode: "merge" | "replace") {
  const text = await file.text();
  const data = JSON.parse(text) as LegacyJsonExportFile;
  if (data.app !== "blue-prince-notes") throw new Error("Not a Blue Prince notes export");

  if (mode === "replace") {
    await clearForReplaceMode();
  }

  for (const n of data.notes ?? []) await db.notes.put(n);
  for (const t of data.todos ?? []) await db.todos.put(t);
  for (const r of data.rooms ?? []) await db.rooms.put(r);
  for (const s of data.sections ?? []) await db.sections.put(s);
  for (const c of data.gridCells ?? []) await db.grid.put(c);
  for (const img of data.images ?? []) {
    const blob = await dataUrlToBlob(img.dataUrl);
    await db.images.put({
      id: img.id,
      name: img.name,
      caption: img.caption,
      tags: img.tags ?? [],
      mime: img.mime,
      blob,
      createdAt: img.createdAt,
    });
  }
}

async function importFromZip(file: File, mode: "merge" | "replace") {
  const JSZip = await getJSZipCtor();
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const manifestFile = zip.file("manifest.json");
  if (!manifestFile) throw new Error("Invalid backup zip: missing manifest.json");

  const manifestText = await manifestFile.async("text");
  const data = JSON.parse(manifestText) as ZipExportManifest;
  if (data.app !== "blue-prince-notes") throw new Error("Not a Blue Prince notes export");

  if (mode === "replace") {
    await clearForReplaceMode();
  }

  if (data.customRooms) {
    if (mode === "replace") {
      replaceCustomRooms(data.customRooms);
    } else {
      const merged = [...listCustomRooms(), ...data.customRooms];
      replaceCustomRooms(merged);
    }
  }

  for (const n of data.notes ?? []) await db.notes.put(n);
  for (const t of data.todos ?? []) await db.todos.put(t);
  for (const r of data.rooms ?? []) await db.rooms.put(r);
  for (const s of data.sections ?? []) await db.sections.put(s);
  for (const c of data.gridCells ?? []) await db.grid.put(c);

  for (const img of data.images ?? []) {
    const imageFile = zip.file(img.file);
    if (!imageFile) continue;
    const blob = await imageFile.async("blob");
    await db.images.put({
      id: img.id,
      name: img.name,
      caption: img.caption,
      tags: img.tags ?? [],
      mime: img.mime,
      blob,
      createdAt: img.createdAt,
    });
  }
}

export async function importAll(file: File, mode: "merge" | "replace"): Promise<void> {
  const fileName = file.name.toLowerCase();
  const isZip = fileName.endsWith(".zip") || file.type === "application/zip";
  if (isZip) {
    await importFromZip(file, mode);
    return;
  }
  await importFromLegacyJson(file, mode);
}

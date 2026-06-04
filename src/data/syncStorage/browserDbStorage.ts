import {
  clearAllData,
  listGridCells,
  listImages,
  listNotes,
  listRoomStates,
  listSections,
  listTodos,
  putGridCell,
  putImage,
  putNote,
  putRoomState,
  putSection,
  putTodo,
} from "@/data/db";
import { listCustomRooms, replaceCustomRooms } from "@/data/rooms";
import { mergeByName } from "./common";
import type { StorageAdapter, AppDataSnapshot } from "./types";

export const browserDbStorage: StorageAdapter = {
  async read() {
    const [notes, todos, images, rooms, sections, gridCells] = await Promise.all([
      listNotes(),
      listTodos(),
      listImages(),
      listRoomStates(),
      listSections(),
      listGridCells(),
    ]);

    return {
      notes,
      todos,
      images,
      rooms,
      sections,
      gridCells,
      customRooms: listCustomRooms().map((room) => ({ name: room.name, category: room.category })),
    };
  },

  async clear() {
    await clearAllData();
    replaceCustomRooms([]);
  },

  async write(data: AppDataSnapshot) {
    for (const note of data.notes) await putNote(note);
    for (const todo of data.todos) await putTodo(todo);
    for (const image of data.images) await putImage(image);
    for (const room of data.rooms) await putRoomState(room);
    for (const section of data.sections) await putSection(section);
    for (const cell of data.gridCells) await putGridCell(cell);

    if (data.customRooms.length > 0) {
      const existing = listCustomRooms().map((r) => ({ name: r.name, category: r.category }));
      replaceCustomRooms(mergeByName(existing, data.customRooms));
    }
  },
};

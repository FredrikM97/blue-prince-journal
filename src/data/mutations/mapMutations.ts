import type { GridCell } from "@/lib/types";
import { db } from "../db";
import { cellId } from "../rooms/rooms";
import { syncRuntime } from "../sync/sync";

export async function upsertCell(
  patch: Partial<GridCell> & { row: number; col: number },
): Promise<void> {
  const id = cellId(patch.row, patch.col);
  const existing = await db.grid.get(id);
  const next: GridCell = {
    id,
    row: patch.row,
    col: patch.col,
    roomName: patch.roomName ?? existing?.roomName,
    comment: patch.comment ?? existing?.comment,
    status: patch.status ?? existing?.status ?? "unknown",
    updatedAt: Date.now(),
  };
  await db.grid.put(next);
  syncRuntime.scheduleWrite();
}

export async function clearCell(row: number, col: number): Promise<void> {
  const id = cellId(row, col);
  await db.grid.delete(id);
  syncRuntime.scheduleWrite();
}

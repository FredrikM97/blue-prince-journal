import { readSnapshot, applySnapshot, clearAllData } from "../db";
import { clearCustomRooms } from "../rooms/rooms";
import { readFolder, writeFolder } from "./syncFolderIO";
import { syncRuntime } from "./syncRuntime";
import type { SyncConflictChoice, SyncConnectResult } from "./sync";

export async function connectSyncFolderWithConflictResolution(
  localItemCount: number,
  resolveConflict: () => Promise<SyncConflictChoice>,
): Promise<SyncConnectResult | null> {
  const handle = await syncRuntime.pickFolder();
  if (!handle) return null;

  const folderData = await readFolder(handle);

  if (!folderData) {
    const localData = await readSnapshot();
    await writeFolder(handle, localData);
    return { handle, resolution: "connected-empty", importedFolderData: false };
  }

  if (localItemCount === 0) {
    await clearAllData();
    clearCustomRooms();
    await applySnapshot(folderData);
    return { handle, resolution: "use-folder-data", importedFolderData: true };
  }

  const choice = await resolveConflict();

  if (choice === "cancel") {
    await syncRuntime.disconnect();
    return null;
  }

  if (choice === "overwrite") {
    await clearAllData();
    clearCustomRooms();
    await applySnapshot(folderData);
    return { handle, resolution: "use-folder-data", importedFolderData: true };
  }

  const localData = await readSnapshot();
  await writeFolder(handle, localData);
  return { handle, resolution: "keep-local-data", importedFolderData: false };
}
import { syncRuntime } from "../sync/sync";
import { clearCustomRooms } from "../rooms/rooms";
import { clearAllData } from "../db";

export async function startFresh(): Promise<void> {
  if (typeof window === "undefined") return;
  await syncRuntime.disconnect();
  await clearAllData();
  clearCustomRooms();
  await import("../db").then(({ ensureBootSeed }) => ensureBootSeed());
}

import { clearAllData } from "../db";
import { clearCustomRooms } from "../rooms/rooms";
import { syncRuntime } from "../sync/sync";

export async function startFresh(): Promise<void> {
  if (typeof window === "undefined") return;
  await syncRuntime.disconnect();
  await clearAllData();
  clearCustomRooms();
  await import("../db").then(({ ensureBootSeed }) => ensureBootSeed());
}

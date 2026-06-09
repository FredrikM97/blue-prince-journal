import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { syncRuntime } from "@/data/sync/sync";
import {
  connectSteamImportFolder,
  disconnectSteamImportFolder,
  isSteamFolderSyncSupported,
  loadSteamImportStatus,
  restoreSteamImportFolder,
  syncConnectedSteamFolder,
} from "@/data/import/steamImport";
import type { StoredImage } from "@/lib/types";

type SyncResult = {
  imported: number;
  skipped: number;
};

type SteamFolderSyncOptions = {
  addImage: (blob: Blob, name?: string, caption?: string) => Promise<StoredImage>;
  syncOnConnect?: boolean;
  flushSyncRuntimeOnImport?: boolean;
  onFolderNameChange?: (name: string | null) => void;
  connectSuccessMessage?: (name: string) => string;
  disconnectSuccessMessage?: string;
  syncEmptyMessage?: string;
};

export function useSteamFolderSync({
  addImage,
  syncOnConnect = false,
  flushSyncRuntimeOnImport = false,
  onFolderNameChange,
  connectSuccessMessage,
  disconnectSuccessMessage = "Steam folder disconnected",
  syncEmptyMessage = "No new screenshots in connected folder",
}: SteamFolderSyncOptions) {
  const [folderName, setFolderName] = useState<string | null>(null);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
  const [lastImported, setLastImported] = useState(0);
  const [lastSkipped, setLastSkipped] = useState(0);
  const [busy, setBusy] = useState(false);
  const supported = isSteamFolderSyncSupported();

  const updateFolderName = useCallback(
    (nextName: string | null) => {
      setFolderName(nextName);
      onFolderNameChange?.(nextName);
    },
    [onFolderNameChange],
  );

  useEffect(() => {
    if (!supported) return;
    void loadSteamImportStatus().then((status) => {
      setLastRefreshAt(status.lastRefreshAt);
      setLastImported(status.lastImported);
      setLastSkipped(status.lastSkipped);
    });
    void restoreSteamImportFolder().then((handle) => {
      if (!handle) return;
      updateFolderName(handle.name);
    });
  }, [supported, updateFolderName]);

  const runSync = useCallback(
    async ({ force = false }: { force?: boolean } = {}): Promise<SyncResult | null> => {
      try {
        const result = await syncConnectedSteamFolder(addImage, force ? { force: true } : undefined);
        if (result === null) {
          toast.error("No Steam folder connected");
          return null;
        }

        setLastRefreshAt(Date.now());
        setLastImported(result.imported);
        setLastSkipped(result.skipped);

        if (result.imported > 0) {
          toast.success(`Imported ${result.imported} screenshot${result.imported === 1 ? "" : "s"}`);
          if (flushSyncRuntimeOnImport) {
            void syncRuntime.saveNow();
          }
        } else {
          toast.success(syncEmptyMessage);
        }

        return result;
      } catch {
        if (force) {
          toast.error("Could not force re-import Steam screenshots");
        } else {
          toast.error("Could not sync Steam screenshots");
        }
        return null;
      }
    },
    [addImage, flushSyncRuntimeOnImport, syncEmptyMessage],
  );

  const syncNow = useCallback(async () => {
    setBusy(true);
    try {
      await runSync();
    } finally {
      setBusy(false);
    }
  }, [runSync]);

  const forceReimportAll = useCallback(async () => {
    setBusy(true);
    try {
      await runSync({ force: true });
    } finally {
      setBusy(false);
    }
  }, [runSync]);

  const connect = useCallback(async () => {
    setBusy(true);
    try {
      const handle = await connectSteamImportFolder();
      if (!handle) return;
      updateFolderName(handle.name);
      toast.success(connectSuccessMessage?.(handle.name) ?? `Connected Steam folder: ${handle.name}`);
      if (syncOnConnect) {
        await runSync();
      }
    } catch {
      toast.error("Could not connect Steam folder");
    } finally {
      setBusy(false);
    }
  }, [connectSuccessMessage, runSync, syncOnConnect, updateFolderName]);

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      await disconnectSteamImportFolder();
      updateFolderName(null);
      toast.success(disconnectSuccessMessage);
    } catch {
      toast.error("Could not disconnect Steam folder");
    } finally {
      setBusy(false);
    }
  }, [disconnectSuccessMessage, updateFolderName]);

  return {
    supported,
    connected: Boolean(folderName),
    folderName,
    lastRefreshAt,
    lastImported,
    lastSkipped,
    busy,
    connect,
    syncNow,
    forceReimportAll,
    disconnect,
  };
}

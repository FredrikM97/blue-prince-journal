import { useEffect, useRef, useState } from "react";
import { FolderOpen, FolderSync, Unlink } from "lucide-react";
import { db } from "@/data/db";
import { useStore } from "@/hooks/useStore";
import {
  connectSyncFolderWithConflictResolution,
  syncRuntime,
  type SyncMode,
} from "@/data/sync/sync";
import { Button } from "@/components/common/Button";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { SyncConflictDialog, type SyncConflictChoice } from "@/components/common/SyncConflictDialog";
import { MetaText, Text } from "@/components/common/Typography";
import { toast } from "sonner";

export function SyncFolderSection() {
  const syncFolderName = useStore((s) => s.syncFolderName);
  const setSyncFolderName = useStore((s) => s.setSyncFolderName);
  const [busy, setBusy] = useState(false);
  const [syncMode, setSyncModeState] = useState<SyncMode>("auto");
  const [dirty, setDirty] = useState(false);
  const [lastDirtyAt, setLastDirtyAt] = useState<number | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const lastReminderRef = useRef<number>(0);
  const [conflictResolve, setConflictResolve] = useState<
    ((choice: SyncConflictChoice) => void) | null
  >(null);

  function openConflictDialog(): Promise<SyncConflictChoice> {
    return new Promise((resolve) => {
      setConflictResolve(() => resolve);
    });
  }

  function handleConflictChoice(choice: SyncConflictChoice) {
    setConflictResolve(null);
    conflictResolve?.(choice);
  }

  const isSupported = typeof window !== "undefined" && "showDirectoryPicker" in window;

  useEffect(() => {
    void syncRuntime.loadMode().then(setSyncModeState);
    const unsubscribe = syncRuntime.subscribeStatus((status) => {
      setSyncModeState(status.mode);
      setDirty(status.dirty);
      setLastDirtyAt(status.lastDirtyAt);
      setLastSyncedAt(status.lastSyncedAt);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (syncMode !== "manual" || !dirty || !lastDirtyAt || !reminderEnabled) {
      return;
    }

    const interval = window.setInterval(() => {
      const now = Date.now();
      const dirtyFor = now - lastDirtyAt;
      const sinceLastReminder = now - lastReminderRef.current;
      if (dirtyFor < 5 * 60_000) return;
      if (sinceLastReminder < 5 * 60_000) return;
      lastReminderRef.current = now;
      toast("Unsynced changes", {
        description: "Manual sync is enabled. Press 'Save to disk now' to persist recent changes.",
      });
    }, 60_000);

    return () => window.clearInterval(interval);
  }, [syncMode, dirty, lastDirtyAt, reminderEnabled]);

  async function handleModeChange(nextMode: SyncMode) {
    setBusy(true);
    try {
      await syncRuntime.setMode(nextMode);
      toast.success(nextMode === "manual" ? "Manual sync enabled" : "Auto sync enabled");
    } catch {
      toast.error("Could not update sync mode");
    } finally {
      setBusy(false);
    }
  }

  async function handleConnect() {
    setBusy(true);
    try {
      const [noteCount, todoCount, imageCount, cellCount] = await Promise.all([
        db.notes.count(),
        db.todos.count(),
        db.images.count(),
        db.grid.count(),
      ]);
      const localItemsCount = noteCount + todoCount + imageCount + cellCount;

      const connectResult = await connectSyncFolderWithConflictResolution(
        localItemsCount,
        openConflictDialog,
      );
      if (!connectResult) {
        return;
      }

      if (connectResult.resolution === "connected-empty") {
        toast.success(`Connected — data will sync to "${connectResult.handle.name}"`);
      }
      if (connectResult.resolution === "use-folder-data") {
        toast.success(`Using folder data from "${connectResult.handle.name}"`);
      }
      if (connectResult.resolution === "keep-local-data") {
        toast.success(`Keeping local data and syncing to "${connectResult.handle.name}"`);
      }

      setSyncFolderName(syncRuntime.getActiveFolderName() ?? connectResult.handle.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "sync-folder-iframe-blocked") {
        toast.error("Open the app in a browser tab — VS Code's preview panel blocks folder access");
      } else if (
        message.toLowerCase().includes("system files") ||
        message.toLowerCase().includes("sensitive")
      ) {
        toast.error("That folder is restricted by the browser. Pick a normal folder instead.");
      } else {
        toast.error("Could not connect to folder");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    await syncRuntime.disconnect();
    setSyncFolderName(null);
    toast.success("Sync folder disconnected");
  }

  async function handleSyncNow() {
    if (!syncRuntime.getActiveHandle()) return;
    setBusy(true);
    try {
      await syncRuntime.saveNow();
      toast.success("Saved to disk");
    } catch {
      toast.error("Sync failed — folder permission may have been revoked");
    } finally {
      setBusy(false);
    }
  }

  async function handleOpenSyncFolder() {
    try {
      const opened = await syncRuntime.openInPicker();
      if (!opened) return;
      toast.success("Opened sync folder picker");
    } catch {
      toast.error("Could not open sync folder picker");
    }
  }

  if (!isSupported) {
    return (
      <Text size="sm" tone="muted">
        Your browser does not support the File System Access API. Try Chrome or Edge.
      </Text>
    );
  }

  if (syncFolderName) {
    return (
      <Stack gap="3">
        <Text as="div" size="sm" className="panel-row">
          <Inline gap="2" justify="between" align="center">
            <Inline gap="2" align="center">
              <FolderSync className="h-4 w-4 shrink-0 text-green-500" />
              <Text as="span" size="sm" weight="medium" minWidthZero truncate>
                {syncFolderName}
              </Text>
            </Inline>
            <MetaText as="span">{syncMode === "manual" ? "manual sync" : "auto-syncing"}</MetaText>
          </Inline>
        </Text>
        <Inline as="label" gap="2" align="center">
          <input
            type="checkbox"
            checked={syncMode === "manual"}
            onChange={(e) => void handleModeChange(e.target.checked ? "manual" : "auto")}
            disabled={busy}
          />
          <Text as="span" size="sm">
            Manual sync mode
          </Text>
        </Inline>
        {syncMode === "manual" && (
          <Inline as="label" gap="2" align="center">
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
            />
            <MetaText as="span">Remind every 5 minutes when unsynced for a while</MetaText>
          </Inline>
        )}
        {dirty && (
          <Text size="xs" weight="medium" intent="warning">
            Unsynced changes
          </Text>
        )}
        <MetaText>
          Sync writes manifest.json plus image files in images/. Place this folder inside Dropbox,
          OneDrive, or iCloud Drive to sync across devices.
        </MetaText>
        <MetaText>
          {lastSyncedAt
            ? `Last saved: ${new Date(lastSyncedAt).toLocaleString()}`
            : "Last saved: never"}
          {dirty && lastDirtyAt
            ? ` • Unsynced since ${new Date(lastDirtyAt).toLocaleTimeString()}`
            : ""}
        </MetaText>
        <Inline gap="2" wrap>
          {syncMode === "manual" ? (
            <Button variant="brass" size="sm" onClick={handleSyncNow} disabled={busy || !dirty}>
              Save to disk now
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleSyncNow} disabled={busy}>
              Sync now
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleOpenSyncFolder} disabled={busy}>
            Open folder
          </Button>
          <Button variant="outline-destructive" size="sm" onClick={handleDisconnect}>
            <Unlink className="mr-1.5 h-3.5 w-3.5" />
            Disconnect
          </Button>
        </Inline>
      </Stack>
    );
  }

  return (
    <Stack gap="3">
      <Text size="sm" tone="muted">
        Connect a local folder and the app will keep <code>manifest.json</code> and an <code>images/</code>{" "}
        folder up to date after every change.
      </Text>
      <Inline as="label" gap="2" align="center">
        <input
          type="checkbox"
          checked={syncMode === "manual"}
          onChange={(e) => void handleModeChange(e.target.checked ? "manual" : "auto")}
          disabled={busy}
        />
        <Text as="span" size="sm">
          Use manual sync mode when connected
        </Text>
      </Inline>
      <Button variant="brass" size="sm" onClick={handleConnect} disabled={busy}>
        <FolderOpen className="mr-2 h-4 w-4" />
        Connect folder...
      </Button>
      <SyncConflictDialog open={Boolean(conflictResolve)} onChoice={handleConflictChoice} />
    </Stack>
  );
}

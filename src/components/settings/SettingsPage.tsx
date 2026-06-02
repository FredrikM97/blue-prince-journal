import { useEffect, useMemo, useRef, useState } from "react";
import { FolderOpen, FolderSync, Unlink } from "lucide-react";
import { useStore } from "@/data/store";
import { Button, BrassButton } from "@/components/common/Button";
import { KeyboardKey } from "@/components/common/KeyboardKey";
import { PageLayout } from "@/components/common/PageLayout";
import { TextInput } from "@/components/common/input/TextInput";
import {
  addCustomRoom,
  getAllRoomGroups,
  listCustomRooms,
  removeCustomRoom,
  ROOM_GROUPS,
  type RoomCategory,
} from "@/data/rooms";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { exportAll, importAll } from "@/data/io";
import { buildGraphTestNotes } from "@/data/seedGraphTest";
import {
  pickSyncFolder,
  disconnectSyncFolder,
  readFromSyncFolder,
  importSyncManifest,
  writeToSyncFolder,
  saveSyncNow,
  loadSyncMode,
  setSyncMode,
  subscribeSyncStatus,
  type SyncMode,
  getActiveSyncHandle,
  getActiveSyncFolderName,
  openSyncFolderInPicker,
} from "@/data/sync";
import {
  connectSteamImportFolder,
  disconnectSteamImportFolder,
  getActiveSteamFolderName,
  isSteamFolderSyncSupported,
  loadSteamImportStatus,
  restoreSteamImportFolder,
  syncConnectedSteamFolder,
} from "@/data/steamImport";
import { toast } from "sonner";
import { SettingsSection, SettingsSubsection } from "./SettingsSection";
import { Heading, MetaText, Text } from "@/components/common/Typography";
import { Stack } from "@/components/common/Stack";
import { Inline, SectionBlock } from "@/components/common/LayoutPrimitives";

export function SettingsPage() {
  const load = useStore((s) => s.load);
  const save = useStore((s) => s.saveNote);
  const fileRef = useRef<HTMLInputElement>(null);
  const [customRooms, setCustomRooms] = useState(() => listCustomRooms());
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCategory, setNewRoomCategory] = useState<RoomCategory>(ROOM_GROUPS[0]);

  const customRoomsByCategory = useMemo(() => {
    const allGroups = getAllRoomGroups();
    const grouped = new Map<string, string[]>();
    allGroups.forEach((group) => grouped.set(group, []));
    customRooms.forEach((room) => {
      if (!grouped.has(room.category)) grouped.set(room.category, []);
      grouped.get(room.category)!.push(room.name);
    });
    return grouped;
  }, [customRooms]);

  const categoryOptions = useMemo(
    () => [...customRoomsByCategory.keys()].map((g) => ({ value: g, label: g })),
    [customRoomsByCategory],
  );

  function addRoom() {
    const roomName = newRoomName.trim();
    if (!roomName) return;
    const next = addCustomRoom(roomName, newRoomCategory);
    setCustomRooms(next);
    setNewRoomName("");
    toast.success("Room added");
  }

  function removeRoom(name: string) {
    const next = removeCustomRoom(name);
    setCustomRooms(next);
    toast.success("Room removed");
  }

  return (
    <PageLayout>
      <PageLayout.Middle>
        <div className="settings-content">
          <header>
            <Heading as="h1" size="3xl">
              Settings
            </Heading>
            <Text size="sm" tone="muted">
              All data lives in your browser. Export regularly to keep a backup.
            </Text>
          </header>

          <SettingsSection title="Data">
            <Inline gap="2" wrap>
              <BrassButton
                size="sm"
                onClick={() => exportAll().then(() => toast.success("Exported"))}
              >
                Export ZIP
              </BrassButton>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
                Import (merge)...
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const f = fileRef.current;
                  if (!f) return;
                  f.dataset.mode = "replace";
                  f.click();
                }}
              >
                Import (replace)...
              </Button>
            </Inline>
            <input
              ref={fileRef}
              type="file"
              accept=".zip,application/zip,application/json,.json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const mode = (e.target.dataset.mode as "merge" | "replace") || "merge";
                try {
                  await importAll(f, mode);
                  await load();
                  toast.success("Imported");
                } catch (err) {
                  toast.error((err as Error).message);
                }
                e.target.value = "";
                e.target.dataset.mode = "merge";
              }}
            />

            <SettingsSubsection title="Sync folder">
              <SyncFolderSection />
            </SettingsSubsection>

            <SettingsSubsection title="Steam screenshots import (optional)">
              <SteamImportSection />
            </SettingsSubsection>

            <SettingsSubsection title="Dev utilities">
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const notes = buildGraphTestNotes();
                  for (const n of notes) await save(n);
                  await load();
                  toast.success(
                    `Seeded ${notes.length} notes across ${new Set(notes.map((n) => n.room)).size} rooms`,
                  );
                }}
              >
                Seed graph test data (~70 rooms)
              </Button>
            </SettingsSubsection>
          </SettingsSection>

          <SectionBlock>
            <SettingsSection title="Rooms">
              <MetaText>
                Add custom rooms under any group. They appear in Map, New Note, and Edit Note room
                dropdowns.
              </MetaText>

              <div className="settings-input-grid">
                <TextInput
                  value={newRoomName}
                  onChange={setNewRoomName}
                  placeholder="New room name"
                />

                <DropdownSelect
                  value={newRoomCategory}
                  onValueChange={(value) => setNewRoomCategory(value as RoomCategory)}
                  options={categoryOptions}
                />

                <Button size="sm" variant="outline" onClick={addRoom}>
                  Add room
                </Button>
              </div>

              <Stack gap="3" variant="panel-card">
                {[...customRoomsByCategory.entries()].map(([group, rooms]) => {
                  if (rooms.length === 0) return null;

                  return (
                    <Stack key={group} gap="2">
                      <Heading as="h3" size="base" variant="section-label">
                        {group}
                      </Heading>
                      <Inline gap="1.5" wrap>
                        {rooms.map((name) => (
                          <Button
                            key={`${group}-${name}`}
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => removeRoom(name)}
                            className="settings-room-chip"
                            title="Remove room"
                          >
                            {name}
                          </Button>
                        ))}
                      </Inline>
                    </Stack>
                  );
                })}
                {customRooms.length === 0 && <MetaText>No custom rooms yet.</MetaText>}
              </Stack>
            </SettingsSection>
          </SectionBlock>

          <SectionBlock>
            <SettingsSection title="Keyboard">
              <Stack as="ul" gap="1">
                <li>
                  <Text size="sm" tone="muted">
                    <KeyboardKey>N</KeyboardKey> - open quick capture
                  </Text>
                </li>
                <li>
                  <Text size="sm" tone="muted">
                    <KeyboardKey>Esc</KeyboardKey> - close capture
                  </Text>
                </li>
                <li>
                  <Text size="sm" tone="muted">
                    <KeyboardKey>Ctrl+Enter</KeyboardKey> - save ·{" "}
                    <KeyboardKey>Ctrl+Shift+Enter</KeyboardKey> - save &amp; keep open
                  </Text>
                </li>
              </Stack>
            </SettingsSection>
          </SectionBlock>
        </div>
      </PageLayout.Middle>
    </PageLayout>
  );
}

function SteamImportSection() {
  const addImage = useStore((s) => s.addImage);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
  const [lastImported, setLastImported] = useState(0);
  const [lastSkipped, setLastSkipped] = useState(0);
  const [connected, setConnected] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const isSupported = isSteamFolderSyncSupported();

  useEffect(() => {
    if (!isSupported) return;
    void loadSteamImportStatus().then((s) => {
      setLastRefreshAt(s.lastRefreshAt);
      setLastImported(s.lastImported);
      setLastSkipped(s.lastSkipped);
    });
    void restoreSteamImportFolder().then((handle) => {
      if (!handle) return;
      setConnected(true);
      setFolderName(handle.name);
    });
  }, [isSupported]);

  async function handleConnect() {
    setBusy(true);
    try {
      const handle = await connectSteamImportFolder();
      if (!handle) return;
      setConnected(true);
      setFolderName(handle.name);
      toast.success(`Connected Steam folder: ${handle.name}`);
    } catch {
      toast.error("Could not connect Steam folder");
    } finally {
      setBusy(false);
    }
  }

  async function handleSync() {
    setBusy(true);
    try {
      const result = await syncConnectedSteamFolder(addImage);
      if (result === null) {
        toast.error("No Steam folder connected");
        return;
      }
      setLastRefreshAt(Date.now());
      setLastImported(result.imported);
      setLastSkipped(result.skipped);
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} screenshot${result.imported === 1 ? "" : "s"}`);
      } else {
        toast.success("No new screenshots in connected folder");
      }
    } catch {
      toast.error("Could not sync Steam screenshots");
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    setBusy(true);
    try {
      await disconnectSteamImportFolder();
      setConnected(false);
      setFolderName(null);
      toast.success("Steam folder disconnected");
    } catch {
      toast.error("Could not disconnect Steam folder");
    } finally {
      setBusy(false);
    }
  }

  if (!isSupported) {
    return (
      <Text size="sm" tone="muted">
        Your browser does not support file access. Steam import requires Chrome or Edge.
      </Text>
    );
  }

  return (
    <Stack gap="3">
      <MetaText>
        Connect a Steam screenshots folder once, then sync from it any time. Imported files are
        skipped automatically.
      </MetaText>

      {!connected && (
        <BrassButton
          size="sm"
          onClick={handleConnect}
          disabled={busy}
          className="settings-steam-action"
        >
          <FolderOpen className="icon-sm" />
          Connect folder…
        </BrassButton>
      )}

      {connected && (
        <Stack gap="1.5">
          <div className="settings-steam-actions-row">
            <BrassButton
              size="sm"
              onClick={handleSync}
              disabled={busy}
              className="settings-steam-action"
            >
              <FolderSync className="icon-sm" />
              Sync now
            </BrassButton>
            <Button variant="ghost" size="sm" onClick={handleDisconnect} disabled={busy}>
              <Unlink className="icon-sm" />
              Disconnect
            </Button>
          </div>
          <span className="settings-steam-connected-label">
            Connected: {folderName ?? getActiveSteamFolderName() ?? "Unknown"}
          </span>
        </Stack>
      )}

      <MetaText>
        Last sync:{" "}
        {lastRefreshAt
          ? `${new Date(lastRefreshAt).toLocaleString()} · imported ${lastImported}, skipped ${lastSkipped}`
          : "Never"}
      </MetaText>
    </Stack>
  );
}

function SyncFolderSection() {
  const syncFolderName = useStore((s) => s.syncFolderName);
  const setSyncFolderName = useStore((s) => s.setSyncFolderName);
  const load = useStore((s) => s.load);
  const [busy, setBusy] = useState(false);
  const [syncMode, setSyncModeState] = useState<SyncMode>("auto");
  const [dirty, setDirty] = useState(false);
  const [lastDirtyAt, setLastDirtyAt] = useState<number | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const lastReminderRef = useRef<number>(0);

  const isSupported = typeof window !== "undefined" && "showDirectoryPicker" in window;

  useEffect(() => {
    void loadSyncMode().then(setSyncModeState);
    const unsubscribe = subscribeSyncStatus((status) => {
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
      await setSyncMode(nextMode);
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
      const handle = await pickSyncFolder();
      if (!handle) {
        setBusy(false);
        return;
      }
      const existing = await readFromSyncFolder(handle);
      if (existing) {
        await importSyncManifest(existing);
        await load();
        toast.success(`Loaded and syncing with "${handle.name}"`);
      } else {
        // Write current data into the new folder immediately
        await writeToSyncFolder(handle);
        toast.success(`Connected — data will sync to "${handle.name}"`);
      }
      setSyncFolderName(getActiveSyncFolderName() ?? handle.name);
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("system files") || message.includes("sensitive")) {
        toast.error("That folder is restricted by the browser. Pick a normal folder instead.");
      } else {
        toast.error("Could not connect to folder");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDisconnect() {
    await disconnectSyncFolder();
    setSyncFolderName(null);
    toast.success("Sync folder disconnected");
  }

  async function handleSyncNow() {
    if (!getActiveSyncHandle()) return;
    setBusy(true);
    try {
      await saveSyncNow();
      toast.success("Saved to disk");
    } catch {
      toast.error("Sync failed — folder permission may have been revoked");
    } finally {
      setBusy(false);
    }
  }

  async function handleOpenSyncFolder() {
    try {
      const opened = await openSyncFolderInPicker();
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
        <div className="panel-row">
          <FolderSync className="h-4 w-4 shrink-0 text-green-500" />
          <span className="min-w-0 flex-1 truncate font-medium">{syncFolderName}</span>
          <span className="shrink-0">
            <MetaText as="span">{syncMode === "manual" ? "manual sync" : "auto-syncing"}</MetaText>
          </span>
        </div>
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
            <BrassButton size="sm" onClick={handleSyncNow} disabled={busy || !dirty}>
              Save to disk now
            </BrassButton>
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
        Connect a local folder and the app will keep <code>manifest.json</code> and an{" "}
        <code>images/</code> folder up to date after every change.
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
      <BrassButton size="sm" onClick={handleConnect} disabled={busy}>
        <FolderOpen className="mr-2 h-4 w-4" />
        Connect folder…
      </BrassButton>
    </Stack>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { FolderOpen, FolderSync, Unlink } from "lucide-react";
import { useStore } from "@/data/store";
import { db } from "@/data/db";
import { addImage, saveNote, saveTodo } from "@/data/mutations";
import { Button } from "@/components/common/Button";
import { KeyboardKey } from "@/components/common/KeyboardKey";
import { PageLayout } from "@/components/common/PageLayout";
import { InputField } from "@/components/common/input/InputField";
import {
  addCustomRoom,
  getAllRoomGroups,
  listCustomRooms,
  removeCustomRoom,
  ROOM_GROUPS,
  type RoomCategory,
} from "@/data/rooms";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { exportAll, importAll } from "@/data/backup";
import {
  attachSeedImagesToNotes,
  buildGraphTestNotes,
  buildGraphTestTodos,
  buildSeedTestImageSpecs,
} from "@/data/seedGraphTest";
import { connectSyncFolderWithConflictResolution, syncRuntime, type SyncMode } from "@/data/sync";
import {
  connectSteamImportFolder,
  disconnectSteamImportFolder,
  isSteamFolderSyncSupported,
  loadSteamImportStatus,
  restoreSteamImportFolder,
  syncConnectedSteamFolder,
} from "@/data/steamImport";
import { isIndexedDbAvailable } from "@/data/storageHealth";
import { toast } from "sonner";
import { SettingsSection, SettingsSubsection } from "./SettingsSection";
import { Heading, MetaText, Text } from "@/components/common/Typography";
import { Stack } from "@/components/common/Stack";
import { CenteredContent, Inline, SectionBlock } from "@/components/common/LayoutPrimitives";
import {
  SyncConflictDialog,
  type SyncConflictChoice,
} from "@/components/common/SyncConflictDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/common/Dialog";

type StorageHealthSnapshot = {
  indexedDbAvailable: boolean;
};

function readStorageHealthSnapshot(): StorageHealthSnapshot {
  return { indexedDbAvailable: isIndexedDbAvailable() };
}

export function SettingsPage() {
  const syncFolderName = useStore((s) => s.syncFolderName);
  const steamFolderName = useStore((s) => s.steamFolderName);
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmSeed, setConfirmSeed] = useState(false);
  const [customRooms, setCustomRooms] = useState(() => listCustomRooms());
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCategory, setNewRoomCategory] = useState<RoomCategory>(ROOM_GROUPS[0]);
  const [storageHealth, setStorageHealth] =
    useState<StorageHealthSnapshot>(readStorageHealthSnapshot);

  useEffect(() => {
    function refreshStorageHealth() {
      setStorageHealth(readStorageHealthSnapshot());
    }

    refreshStorageHealth();
    const intervalId = window.setInterval(refreshStorageHealth, 15000);
    return () => window.clearInterval(intervalId);
  }, []);

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

  async function handleSeedData() {
    const notes = buildGraphTestNotes();
    const imageSpecs = buildSeedTestImageSpecs();
    const imageIds: string[] = [];
    for (const image of imageSpecs) {
      const created = await addImage(image.blob, image.name, image.caption);
      imageIds.push(created.id);
    }
    const notesWithImages = attachSeedImagesToNotes(notes, imageIds);
    for (const n of notesWithImages) await saveNote(n);
    const todos = buildGraphTestTodos(notesWithImages);
    for (const t of todos) await saveTodo(t);
    toast.success(
      `Seeded ${notesWithImages.length} notes and ${todos.length} todos across ${new Set(notesWithImages.map((n) => n.room)).size} rooms with ${imageIds.length} images`,
    );
  }

  return (
    <>
      <PageLayout>
        <PageLayout.Middle>
          <CenteredContent max="2xl" align="left">
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
                <Button
                  variant="brass"
                  size="sm"
                  onClick={() => exportAll().then(() => toast.success("Exported"))}
                >
                  Export ZIP
                </Button>
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
                hidden
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const mode = (e.target.dataset.mode as "merge" | "replace") || "merge";
                  try {
                    await importAll(f, mode);
                    toast.success("Imported");
                  } catch (err) {
                    toast.error((err as Error).message);
                  }
                  e.target.value = "";
                  e.target.dataset.mode = "merge";
                }}
              />

              <SettingsSubsection title="Storage health">
                <Stack gap="1.5" variant="panel-card">
                  <Inline gap="2" justify="between" align="center">
                    <MetaText as="span">Active storage</MetaText>
                    <Text
                      as="span"
                      size="xs"
                      tone={
                        syncFolderName || storageHealth.indexedDbAvailable ? "default" : "muted"
                      }
                    >
                      {syncFolderName
                        ? `Local (${syncFolderName})`
                        : storageHealth.indexedDbAvailable
                          ? "Browser (IndexedDB)"
                          : "Local (fallback)"}
                    </Text>
                  </Inline>
                  <Inline gap="2" justify="between" align="center">
                    <MetaText as="span">Sync folder</MetaText>
                    <Text as="span" size="xs" tone={syncFolderName ? "default" : "muted"}>
                      {syncFolderName ? `Connected (${syncFolderName})` : "Disconnected"}
                    </Text>
                  </Inline>
                  <Inline gap="2" justify="between" align="center">
                    <MetaText as="span">Steam images</MetaText>
                    <Text as="span" size="xs" tone={steamFolderName ? "default" : "muted"}>
                      {steamFolderName ? `Connected (${steamFolderName})` : "Not connected"}
                    </Text>
                  </Inline>
                </Stack>
              </SettingsSubsection>

              <SettingsSubsection title="Sync folder">
                <SyncFolderSection />
              </SettingsSubsection>

              <SettingsSubsection title="Steam images">
                <SteamImportSection />
              </SettingsSubsection>

              <SettingsSubsection title="Dev utilities">
                <Button size="sm" variant="outline" onClick={() => setConfirmSeed(true)}>
                  Seed graph test data with images
                </Button>
              </SettingsSubsection>
            </SettingsSection>

            <SectionBlock>
              <SettingsSection title="Rooms">
                <MetaText>
                  Add custom rooms under any group. They appear in Map, New Note, and Edit Note room
                  dropdowns.
                </MetaText>

                <Inline gap="2" wrap align="end">
                  <InputField
                    value={newRoomName}
                    onChange={setNewRoomName}
                    placeholder="New room name"
                    grow
                  />

                  <DropdownSelect
                    value={newRoomCategory}
                    onValueChange={(value) => setNewRoomCategory(value as RoomCategory)}
                    options={categoryOptions}
                  />

                  <Button size="sm" variant="outline" onClick={addRoom}>
                    Add room
                  </Button>
                </Inline>

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
          </CenteredContent>
        </PageLayout.Middle>
      </PageLayout>

      <Dialog open={confirmSeed} onOpenChange={setConfirmSeed}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seed graph test data?</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            This will add test notes, todos, and images. Existing data will not be removed, but
            rooms may overlap with seeded content.
          </DialogDescription>
          <Inline gap="2" justify="end">
            <Button variant="outline" size="sm" onClick={() => setConfirmSeed(false)}>
              Cancel
            </Button>
            <Button
              variant="brass"
              size="sm"
              onClick={() => {
                setConfirmSeed(false);
                void handleSeedData();
              }}
            >
              Seed data
            </Button>
          </Inline>
        </DialogContent>
      </Dialog>
    </>
  );
}

function SteamImportSection() {
  const steamFolderName = useStore((s) => s.steamFolderName);
  const setSteamFolderName = useStore((s) => s.setSteamFolderName);
  const [lastRefreshAt, setLastRefreshAt] = useState<number | null>(null);
  const [lastImported, setLastImported] = useState(0);
  const [lastSkipped, setLastSkipped] = useState(0);
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
      setSteamFolderName(handle.name);
    });
  }, [isSupported, setSteamFolderName]);

  async function handleConnect() {
    setBusy(true);
    try {
      const handle = await connectSteamImportFolder();
      if (!handle) return;
      setSteamFolderName(handle.name);
      toast.success(`Connected Steam images folder: ${handle.name}`);
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
      setSteamFolderName(null);
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
        Connect a Steam images folder once, then sync from it any time. Imported files are skipped
        automatically.
      </MetaText>
      <MetaText>
        Browsers cannot reliably access protected Steam system folders. Set Steam to save
        screenshots to a normal user folder (e.g. Downloads/BluePrinceScreenshots), then connect it
        here.
      </MetaText>

      {!steamFolderName && (
        <Button
          variant="brass"
          size="sm"
          onClick={handleConnect}
          disabled={busy}
          className="settings-steam-action"
        >
          <FolderOpen className="icon-sm" />
          Connect folder…
        </Button>
      )}

      {steamFolderName && (
        <Stack gap="1.5">
          <Inline gap="2" wrap align="center">
            <Button
              variant="brass"
              size="sm"
              onClick={handleSync}
              disabled={busy}
              className="settings-steam-action"
            >
              <FolderSync className="icon-sm" />
              Sync now
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDisconnect} disabled={busy}>
              <Unlink className="icon-sm" />
              Disconnect
            </Button>
          </Inline>
          <MetaText as="span" size="xs">
            Connected: {steamFolderName}
          </MetaText>
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

      if (connectResult.importedFolderData) {
        // useLiveQuery will update reactively
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
        <Text as="div" size="sm" variant="panel-row">
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
      <Button variant="brass" size="sm" onClick={handleConnect} disabled={busy}>
        <FolderOpen className="mr-2 h-4 w-4" />
        Connect folder…
      </Button>
      <SyncConflictDialog open={Boolean(conflictResolve)} onChoice={handleConflictChoice} />
    </Stack>
  );
}

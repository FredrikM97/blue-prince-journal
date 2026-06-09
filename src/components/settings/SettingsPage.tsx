import { useEffect, useRef, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { saveNote } from "@/data/mutations/noteMutations";
import { saveTodo } from "@/data/mutations/todoMutations";
import { addImage } from "@/data/mutations/imageMutations";
import { Button } from "@/components/common/Button";
import { KeyboardKey } from "@/components/common/KeyboardKey";
import { PageLayout } from "@/components/common/PageLayout";
import { exportAll, importAll } from "@/data/storage/backup";
import {
  attachSeedImagesToNotes,
  buildGraphTestNotes,
  buildGraphTestTodos,
  buildSeedTestImageSpecs,
} from "../../../tests/fixtures/seedGraphTest";
import { isIndexedDbAvailable } from "@/data/storage/storageHealth";
import { toast } from "sonner";
import { SettingsSection, SettingsSubsection } from "./SettingsSection";
import { SettingsRoomsSection } from "./SettingsRoomsSection";
import { SyncFolderSection } from "./SettingsSyncSection";
import { SteamImportSection } from "./SettingsSteamSection.tsx";
import { Heading, MetaText, Text } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";
import { CenteredContent, Inline, SectionBlock } from "@/components/common/LayoutPrimitives";
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

            <SettingsRoomsSection />

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



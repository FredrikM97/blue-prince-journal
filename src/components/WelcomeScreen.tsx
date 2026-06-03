import { useRef, useState } from "react";
import { FolderOpen, Sparkles, Upload, Waypoints } from "lucide-react";
import { importAll } from "@/data/io";
import {
  pickSyncFolder,
  readFromSyncFolder,
  importSyncManifest,
  getActiveSyncFolderName,
} from "@/data/sync";
import { useStore } from "@/data/store";
import { Heading, Text } from "@/components/common/Typography";
import { CenteredContent, Inline } from "@/components/common/LayoutPrimitives";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/Stack";
import { toast } from "sonner";

function WelcomeCard({
  icon: Icon,
  title,
  description,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="content"
      iconSize="2xl"
      onClick={onClick}
      disabled={disabled}
      className="welcome-card"
      fullWidth
      direction="column"
      justify="start"
      textAlign="center"
    >
      <Icon className="text-brass" />
      <Stack gap="1" variant="default">
        <Text size="base" weight="medium">
          {title}
        </Text>
        <Text size="xs" tone="muted" marginTop="1">
          {description}
        </Text>
      </Stack>
    </Button>
  );
}

export function WelcomeScreen({
  onDone,
  onContinue,
  showContinueSuggestion,
}: {
  onDone: (syncFolderName?: string) => void;
  onContinue?: () => void;
  showContinueSuggestion?: boolean;
}) {
  const load = useStore((s) => s.load);
  const startFresh = useStore((s) => s.startFresh);
  const fileRef = useRef<HTMLInputElement>(null);
  const [connecting, setConnecting] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleStartFresh() {
    setResetting(true);
    try {
      await startFresh();
      toast.success("Started fresh");
      onDone();
    } catch {
      toast.error("Could not reset existing data");
    } finally {
      setResetting(false);
    }
  }

  async function handleConnectFolder() {
    setConnecting(true);
    try {
      const handle = await pickSyncFolder();
      if (!handle) {
        setConnecting(false);
        return;
      }
      const existing = await readFromSyncFolder(handle);
      if (existing) {
        await importSyncManifest(existing);
        await load();
        toast.success(`Loaded data from "${handle.name}"`);
      } else {
        toast.success(`Connected to "${handle.name}" — data will sync here automatically`);
      }
      onDone(getActiveSyncFolderName() ?? handle.name);
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("system files") || message.includes("sensitive")) {
        toast.error("That folder is restricted by the browser. Pick a normal folder instead.");
      } else {
        toast.error("Could not connect to folder");
      }
    } finally {
      setConnecting(false);
    }
  }

  async function handleImport(file: File) {
    try {
      await importAll(file, "replace");
      await load();
      toast.success("Data imported");
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <Stack as="section" variant="welcome-shell" gap="0">
      <CenteredContent max="6xl" align="center">
        <Stack gap="2">
          <Stack as="div" variant="welcome-icon" gap="0">
            <Text as="span" size="3xl" weight="semibold">
              B
            </Text>
          </Stack>
          <Heading as="h1" size="3xl">
            Welcome to Blue Prince Journal
          </Heading>
          <Text size="sm" tone="muted" marginTop="2">
            How would you like to get started?
          </Text>
        </Stack>

        <Inline gap="2" justify="center" wrap>
          {showContinueSuggestion && onContinue ? (
            <WelcomeCard
              icon={Waypoints}
              title="Continue"
              description="Pick up where you left off"
              onClick={onContinue}
            />
          ) : null}
          <WelcomeCard
            icon={Sparkles}
            title="Start fresh"
            description="Clear existing data and begin with an empty notebook"
            onClick={handleStartFresh}
            disabled={resetting || connecting}
          />
          <WelcomeCard
            icon={Upload}
            title="Import backup"
            description="Load a ZIP or JSON export"
            onClick={() => fileRef.current?.click()}
          />
          <WelcomeCard
            icon={FolderOpen}
            title="Sync folder"
            description="Pick a local or cloud-backed folder to auto-sync"
            onClick={handleConnectFolder}
            disabled={connecting || resetting}
          />
        </Inline>

        <Text size="xs" tone="muted">
          You can always import, export, or configure a sync folder later in{" "}
          <strong>Settings</strong>.
        </Text>
      </CenteredContent>

      <input
        ref={fileRef}
        type="file"
        accept=".zip,application/zip,application/json,.json"
        hidden
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          await handleImport(f);
          e.target.value = "";
        }}
      />
    </Stack>
  );
}

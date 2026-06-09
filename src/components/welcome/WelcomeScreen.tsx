import { useRef } from "react";
import { FolderOpen, Sparkles, Upload, Waypoints } from "lucide-react";
import { Heading, Text } from "@/components/common/Typography";
import { CenteredContent, Inline } from "@/components/common/LayoutPrimitives";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/general/Stack";
import {
  SyncConflictDialog,
} from "@/components/common/SyncConflictDialog";
import { useWelcomeScreenActions } from "@/hooks/useWelcomeScreenActions";

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
    <Stack className="welcome-card" gap="0">
      <Button
        type="button"
        variant="ghost"
        size="content"
        iconSize="2xl"
        onClick={onClick}
        disabled={disabled}
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
    </Stack>
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
  const fileRef = useRef<HTMLInputElement>(null);
  const {
    busy,
    conflictResolve,
    handleConflictChoice,
    handleStartFresh,
    handleConnectFolder,
    handleImport,
  } = useWelcomeScreenActions({ onDone });

  return (
    <Stack as="section" className="welcome-shell" gap="0">
      <CenteredContent max="6xl" align="center">
        <Stack gap="2">
          <Stack as="div" className="welcome-icon" gap="0">
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
              disabled={busy}
            />
          ) : null}
          <WelcomeCard
            icon={Sparkles}
            title="Start fresh"
            description="Clear existing data and begin with an empty notebook"
            onClick={handleStartFresh}
            disabled={busy}
          />
          <WelcomeCard
            icon={Upload}
            title="Import backup"
            description="Load a ZIP or JSON export"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          />
          <WelcomeCard
            icon={FolderOpen}
            title="Sync folder"
            description="Pick a local or cloud-backed folder to auto-sync"
            onClick={handleConnectFolder}
            disabled={busy}
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

      <SyncConflictDialog open={Boolean(conflictResolve)} onChoice={handleConflictChoice} />
    </Stack>
  );
}

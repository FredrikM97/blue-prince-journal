import { useRef } from "react";
import { FolderOpen, Sparkles, Upload, Waypoints } from "lucide-react";
import { Heading, Text } from "@/components/common/Typography";
import { CenteredContent } from "@/components/common/LayoutPrimitives";
import { Button } from "@/components/common/Button";
import { Stack } from "@/components/common/general/Stack";
import {
  SyncConflictDialog,
} from "@/components/common/SyncConflictDialog";
import { useWelcomeScreenActions } from "./useWelcomeScreenActions";

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
    <Stack className="w-full sm:w-[18rem]" gap="0">
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
        className="gap-3 rounded-xl border border-border bg-card px-4 py-4 whitespace-normal shadow-sm hover:border-brass hover:bg-card sm:min-h-[8rem]"
      >
        <Icon className="text-brass" />
        <Stack gap="1" variant="default" className="w-full px-1">
          <Text
            size="base"
            weight="medium"
            className="min-h-[1.5rem] w-full whitespace-normal break-words leading-tight"
          >
            {title}
          </Text>
          <Text
            size="xs"
            tone="muted"
            marginTop="1"
            className="min-h-[2.5rem] w-full whitespace-normal break-words leading-snug"
          >
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
  const showContinueCard = Boolean(showContinueSuggestion && onContinue);
  const actionsLayoutClassName = "mx-auto flex w-full max-w-[56rem] flex-wrap justify-center gap-2";

  return (
    <Stack
      as="section"
      className="flex h-full flex-col items-center justify-center px-4 py-12 max-[47.99rem]:justify-start max-[47.99rem]:pt-16"
      gap="0"
    >
      <CenteredContent max="6xl" align="center">
        <Stack gap="2">
          <Stack
            as="div"
            className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-brass text-brass-foreground"
            gap="0"
          >
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

        <div className={actionsLayoutClassName}>
          {showContinueCard && onContinue ? (
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
        </div>

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

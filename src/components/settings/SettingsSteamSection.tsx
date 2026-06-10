import { FolderOpen, FolderSync, Unlink } from "lucide-react";
import { addImage } from "@/data/mutations/imageMutations";
import { useStore } from "@/hooks/useStore";
import { Button } from "@/components/common/Button";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { MetaText, Text } from "@/components/common/Typography";
import { useSteamFolderSync } from "@/hooks/useSteamFolderSync";

export function SteamImportSection() {
  const setSteamFolderName = useStore((s) => s.setSteamFolderName);
  const steamSync = useSteamFolderSync({
    addImage,
    onFolderNameChange: setSteamFolderName,
    connectSuccessMessage: (name) => `Connected Steam images folder: ${name}`,
  });

  if (!steamSync.supported) {
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

      {!steamSync.folderName && (
        <Button variant="brass" size="sm" onClick={steamSync.connect} disabled={steamSync.busy}>
          <FolderOpen className="h-3.5 w-3.5" />
          Connect folder...
        </Button>
      )}

      {steamSync.folderName && (
        <Stack gap="1.5">
          <Inline gap="2" wrap align="center">
            <Button variant="brass" size="sm" onClick={steamSync.syncNow} disabled={steamSync.busy}>
              <FolderSync className="h-3.5 w-3.5" />
              Sync now
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={steamSync.disconnect}
              disabled={steamSync.busy}
            >
              <Unlink className="h-3.5 w-3.5" />
              Disconnect
            </Button>
          </Inline>
          <MetaText as="span" size="xs">
            Connected: {steamSync.folderName}
          </MetaText>
        </Stack>
      )}

      <MetaText>
        Last sync:{" "}
        {steamSync.lastRefreshAt
          ? `${new Date(steamSync.lastRefreshAt).toLocaleString()} · imported ${steamSync.lastImported}, skipped ${steamSync.lastSkipped}`
          : "Never"}
      </MetaText>
    </Stack>
  );
}

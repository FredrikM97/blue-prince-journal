import { Button } from "@/components/common/Button";
import { Heading, Text } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { SidePanel } from "@/components/common/SidePanel";

export type SteamSyncPanelModel = {
  supported: boolean;
  connected: boolean;
  folderName: string | null;
  lastSyncAt: number | null;
  busy: boolean;
  connect: () => Promise<void>;
  syncNow: () => Promise<void>;
  disconnect: () => Promise<void>;
};

function formatLastRefreshTime(lastRefreshAt: number | null): string {
  if (!lastRefreshAt) return "Never";
  return new Date(lastRefreshAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Left sidebar panel for image page summary and Steam refresh actions.
 */
export function ImagesLeftPanel({
  total,
  steamSync,
}: {
  total: number;
  steamSync: SteamSyncPanelModel;
}) {
  const refreshTime = formatLastRefreshTime(steamSync.lastSyncAt);
  let lastSyncTitle = "Never";
  if (steamSync.lastSyncAt) {
    lastSyncTitle = new Date(steamSync.lastSyncAt).toLocaleString();
  }

  return (
    <SidePanel.Left title="Images" subtitle={`${total} stored`} panelKey="images-library">
      <Stack gap="2">
        <Text size="xs" tone="muted">
          Click an image to open details in the right panel. Use the preview button there for full
          size.
        </Text>

        {steamSync.supported && steamSync.connected && (
          <Stack gap="1.5">
            <Heading as="h2" size="base">
              Steam Folder
            </Heading>

            <Text size="xs" tone="muted">
              Connected: {steamSync.folderName}
            </Text>
            <Inline gap="2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void steamSync.syncNow()}
                disabled={steamSync.busy}
              >
                Sync now
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => void steamSync.disconnect()}
                disabled={steamSync.busy}
              >
                Disconnect
              </Button>
            </Inline>
            <Text as="span" size="xs" tone="muted" title={lastSyncTitle}>
              Last sync: {refreshTime}
            </Text>
          </Stack>
        )}
      </Stack>
    </SidePanel.Left>
  );
}

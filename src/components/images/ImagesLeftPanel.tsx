import { Button } from "@/components/common/Button";
import { Heading, Text } from "@/components/common/Typography";
import { Inline } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/Stack";
import { SidePanel } from "@/components/common/SidePanel";
import type { SteamDeletedImportEntry } from "@/data/steamImport";
import type { StoredImage } from "@/lib/types";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";

export type ImagesSortMode = "newest" | "oldest" | "name-asc" | "name-desc";

export type SteamSyncPanelModel = {
  supported: boolean;
  connected: boolean;
  folderName: string | null;
  lastSyncAt: number | null;
  deletedImports: SteamDeletedImportEntry[];
  busy: boolean;
  connect: () => Promise<void>;
  syncNow: () => Promise<void>;
  forceReimportAll: () => Promise<void>;
  disconnect: () => Promise<void>;
  markDeletedByImageId: (imageId: string, fileName: string) => Promise<void>;
  undeleteImport: (sourceKey: string, fileName: string) => Promise<StoredImage | null>;
  loadDeletedImportPreview: (sourceKey: string) => Promise<Blob | null>;
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
  viewMode,
  sortMode,
  onChangeViewMode,
  onChangeSortMode,
}: {
  total: number;
  steamSync: SteamSyncPanelModel;
  viewMode: "library" | "deleted-imports";
  sortMode: ImagesSortMode;
  onChangeViewMode: (mode: "library" | "deleted-imports") => void;
  onChangeSortMode: (mode: ImagesSortMode) => void;
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
          Click an image to open details in the right panel.
        </Text>

        <Stack gap="1.5">
          <Heading as="h2" size="base">
            View
          </Heading>
          <Inline gap="2">
            <Button
              variant={viewMode === "library" ? "brass" : "outline"}
              size="sm"
              onClick={() => onChangeViewMode("library")}
            >
              Library
            </Button>
            <Button
              variant={viewMode === "deleted-imports" ? "brass" : "outline"}
              size="sm"
              onClick={() => onChangeViewMode("deleted-imports")}
            >
              Deleted imports ({steamSync.deletedImports.length})
            </Button>
          </Inline>
        </Stack>

        <Stack gap="1.5">
          <Heading as="h2" size="base">
            Sort
          </Heading>
          <DropdownSelect
            value={sortMode}
            onValueChange={(next) => onChangeSortMode(next as ImagesSortMode)}
            placeholder="Sort order"
            triggerWidth="full"
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "name-asc", label: "Name A-Z" },
              { value: "name-desc", label: "Name Z-A" },
            ]}
          />
        </Stack>

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
                variant="outline"
                size="sm"
                onClick={() => void steamSync.forceReimportAll()}
                disabled={steamSync.busy}
              >
                Force re-import all
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

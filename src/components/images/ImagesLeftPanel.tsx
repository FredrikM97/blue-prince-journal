import { Button } from "@/components/common/Button";

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
    <div className="page-layout-panel">
      <h1 className="font-serif text-2xl">Images</h1>
      <p className="mt-1 text-xs text-muted-foreground">{total} stored images</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Click an image to open details in the right panel. Use the preview button there for full
        size.
      </p>

      {steamSync.supported && (
        <div className="mt-2 space-y-1.5">
          <h2 className="font-serif text-base">Steam Folder</h2>

          {!steamSync.connected && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void steamSync.connect()}
              disabled={steamSync.busy}
            >
              Connect folder
            </Button>
          )}

          {steamSync.connected && (
            <>
              <p className="text-xs text-muted-foreground">Connected: {steamSync.folderName}</p>
              <div className="flex items-center gap-2">
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
              </div>
              <span className="text-xs text-muted-foreground" title={lastSyncTitle}>
                Last sync: {refreshTime}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

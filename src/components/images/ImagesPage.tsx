import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useStore } from "@/data/store";
import { PageLayout } from "@/components/common/PageLayout";
import { StoredImageView } from "@/components/StoredImageView";
import { ImagesLeftPanel, type SteamSyncPanelModel } from "@/components/images/ImagesLeftPanel";
import { ImagesRightPanel } from "@/components/images/ImagesRightPanel";
import { EmptyState } from "@/components/common/EmptyState";
import { Text } from "@/components/common/Typography";
import type { StoredImage } from "@/lib/types";
import { toast } from "sonner";
import {
  connectSteamImportFolder,
  disconnectSteamImportFolder,
  getActiveSteamFolderName,
  isSteamFolderSyncSupported,
  loadSteamImportStatus,
  restoreSteamImportFolder,
  syncConnectedSteamFolder,
} from "@/data/steamImport";

function getImageLabel(img: StoredImage): string {
  return img.caption?.trim() || img.name;
}

export function ImagesPage() {
  const images = useStore((s) => s.images);
  const notes = useStore((s) => s.notes);
  const addImage = useStore((s) => s.addImage);
  const removeImage = useStore((s) => s.removeImage);
  const updateImage = useStore((s) => s.updateImage);
  const search = useStore((s) => s.search);
  const deferredSearch = useDeferredValue(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const steamSync = useSteamSyncPanel(addImage);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return images;
    return images.filter((i) => `${i.name} ${getImageLabel(i)}`.toLowerCase().includes(q));
  }, [images, deferredSearch]);

  const selectedIndex = useMemo(
    () => filtered.findIndex((img) => img.id === selectedId),
    [filtered, selectedId],
  );
  const selected = useMemo(() => {
    if (selectedIndex >= 0) return filtered[selectedIndex];
    return filtered[0] ?? null;
  }, [filtered, selectedIndex]);

  const relatedNotes = useMemo(
    () => (selected ? notes.filter((note) => note.imageIds.includes(selected.id)) : []),
    [notes, selected],
  );

  const selectByOffset = useCallback(
    (offset: number) => {
      if (filtered.length === 0) return;
      if (selectedIndex < 0) {
        setSelectedId(filtered[0].id);
        return;
      }
      const next = (selectedIndex + offset + filtered.length) % filtered.length;
      setSelectedId(filtered[next].id);
    },
    [filtered, selectedIndex],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const typing = target && /input|textarea|select|button/i.test(target.tagName);
      if (typing) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        selectByOffset(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        selectByOffset(1);
      } else if (e.key === "Enter") {
        if (!selected) return;
        e.preventDefault();
        setPreviewOpen(true);
      } else if (e.key === "Escape") {
        setPreviewOpen(false);
        setSelectedId(null);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectByOffset]);

  return (
    <PageLayout variant="panel">
      <PageLayout.Left>
        <ImagesLeftPanel total={filtered.length} steamSync={steamSync} />
      </PageLayout.Left>

      <PageLayout.Middle>
        {filtered.length === 0 && (
          <EmptyState>
            <Text>No images yet. Add one from note capture or from a note editor.</Text>
          </EmptyState>
        )}

        {filtered.length > 0 && (
          <div className="images-grid">
            {filtered.map((img) => (
              <ImageThumb
                key={img.id}
                img={img}
                selected={img.id === selectedId}
                onClick={() => setSelectedId(img.id)}
              />
            ))}
          </div>
        )}
      </PageLayout.Middle>

      <PageLayout.Right>
        <ImagesRightPanel
          img={selected}
          relatedNotes={relatedNotes}
          previewOpen={previewOpen}
          setPreviewOpen={setPreviewOpen}
          onPrev={() => selectByOffset(-1)}
          onNext={() => selectByOffset(1)}
          onClose={() => setSelectedId(null)}
          onDelete={async () => {
            if (!selected) return;
            await removeImage(selected.id);
            if (filtered.length <= 1) {
              setSelectedId(null);
              return;
            }
            selectByOffset(1);
          }}
          onSaveLabel={async (label) => {
            if (!selected) return;
            const next = label.trim() || selected.name;
            if (next === getImageLabel(selected)) return;
            await updateImage({ ...selected, caption: next });
            toast.success("Image label updated");
          }}
        />
      </PageLayout.Right>
    </PageLayout>
  );
}

function useSteamSyncPanel(
  addImage: (blob: Blob, name?: string, caption?: string) => Promise<unknown>,
) {
  const [connected, setConnected] = useState(false);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [lastSyncAt, setLastSyncAt] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadSteamImportStatus().then((s) => setLastSyncAt(s.lastRefreshAt));
    void restoreSteamImportFolder().then((handle) => {
      if (!handle) return;
      setConnected(true);
      setFolderName(handle.name);
    });
  }, []);

  async function connect() {
    setBusy(true);
    try {
      const handle = await connectSteamImportFolder();
      if (!handle) return;
      setConnected(true);
      setFolderName(handle.name);
      toast.success(`Connected Steam folder: ${handle.name}`);
      await syncNow();
    } catch {
      toast.error("Could not connect Steam folder");
    } finally {
      setBusy(false);
    }
  }

  async function syncNow() {
    setBusy(true);
    try {
      const result = await syncConnectedSteamFolder(addImage);
      if (result === null) {
        toast.error("No Steam folder connected");
        return;
      }
      setLastSyncAt(Date.now());
      if (result.imported > 0) {
        toast.success(`Imported ${result.imported} screenshot${result.imported === 1 ? "" : "s"}`);
      }
      if (result.imported === 0) {
        toast.success("No new Steam screenshots found in connected folder");
      }
    } catch {
      toast.error("Could not sync Steam screenshots");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    try {
      await disconnectSteamImportFolder();
      setConnected(false);
      setFolderName(null);
      toast.success("Disconnected Steam folder sync");
    } catch {
      toast.error("Could not disconnect Steam folder sync");
    } finally {
      setBusy(false);
    }
  }

  const steamSync: SteamSyncPanelModel = {
    supported: isSteamFolderSyncSupported(),
    connected,
    folderName: folderName ?? getActiveSteamFolderName(),
    lastSyncAt,
    busy,
    connect,
    syncNow,
    disconnect,
  };

  return steamSync;
}

function ImageThumb({
  img,
  selected,
  onClick,
}: {
  img: StoredImage;
  selected: boolean;
  onClick: () => void;
}) {
  let thumbClass = "group images-thumb";
  if (selected) thumbClass = "group images-thumb images-thumb-selected";
  return (
    <button type="button" onClick={onClick} className={thumbClass}>
      <StoredImageView id={img.id} alt={img.name} className="images-thumb-image" />
      <div className="images-thumb-overlay">
        <Text as="div" size="xs" tone="default" variant="default" truncate>
          {getImageLabel(img)}
        </Text>
      </div>
    </button>
  );
}

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { useStore } from "@/hooks/useStore";
import { db } from "@/data/db";
import { addImage, removeImage, updateImage } from "@/data/mutations/imageMutations";
import type { StoredImage, Note } from "@/lib/types";
import { PageLayout } from "@/components/common/PageLayout";
import {
  ImagesLeftPanel,
  type ImagesSortMode,
  type SteamSyncPanelModel,
} from "@/components/images/ImagesLeftPanel";
import { ImagesRightPanel } from "@/components/images/ImagesRightPanel";
import { ImageThumbButton } from "@/components/images/ImageThumbButton";
import { DeletedImportThumbCard } from "@/components/images/DeletedImportThumbCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Grid } from "@/components/common/LayoutPrimitives";
import { Text } from "@/components/common/Typography";
import { toast } from "sonner";
import {
  getActiveSteamFolderName,
  loadSteamImportSourceBlob,
  loadSteamDeletedImports,
  markSteamImportedImageDeleted,
  getSteamImportedImageIdsForSource,
  restoreDeletedSteamImportImage,
  permanentlyDeleteSteamImport,
  type SteamDeletedImportEntry,
} from "@/data/import/steamImport";
import { syncRuntime } from "@/data/sync/sync";
import { getLocalStorageFlag, setLocalStorageFlag } from "@/data/storage/storageHealth";
import { useLiveQueryArray } from "@/hooks/useLiveQueryArray";
import { getImageLabel } from "@/lib/imageLabel";
import { useSteamFolderSync } from "@/hooks/useSteamFolderSync";

export function ImagesPage() {
  const images: StoredImage[] = useLiveQueryArray(() => db.images.toArray());
  const notes: Note[] = useLiveQueryArray(() => db.notes.toArray());
  const search = useStore((s) => s.search);
  const deferredSearch = useDeferredValue(search);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"library" | "deleted-imports">("library");
  const [sortMode, setSortMode] = useState<ImagesSortMode>("newest");
  const steamSync = useSteamSyncPanel(addImage);

  const sortedImages = useMemo(() => {
    const next = [...images];
    if (sortMode === "newest") {
      next.sort((a, b) => b.createdAt - a.createdAt);
      return next;
    }
    if (sortMode === "oldest") {
      next.sort((a, b) => a.createdAt - b.createdAt);
      return next;
    }
    if (sortMode === "name-asc") {
      next.sort((a, b) => getImageLabel(a).localeCompare(getImageLabel(b)));
      return next;
    }
    next.sort((a, b) => getImageLabel(b).localeCompare(getImageLabel(a)));
    return next;
  }, [images, sortMode]);

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    if (!q) return sortedImages;
    return sortedImages.filter((i) => `${i.name} ${getImageLabel(i)}`.toLowerCase().includes(q));
  }, [sortedImages, deferredSearch]);

  const filteredDeletedImports = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const next = [...steamSync.deletedImports];
    if (sortMode === "newest") {
      next.sort((a, b) => b.deletedAt - a.deletedAt);
    } else if (sortMode === "oldest") {
      next.sort((a, b) => a.deletedAt - b.deletedAt);
    } else if (sortMode === "name-asc") {
      next.sort((a, b) => a.fileName.localeCompare(b.fileName));
    } else {
      next.sort((a, b) => b.fileName.localeCompare(a.fileName));
    }

    if (!q) return next;
    return next.filter((entry) => `${entry.fileName} ${entry.sourceKey}`.toLowerCase().includes(q));
  }, [steamSync.deletedImports, deferredSearch, sortMode]);

  const selectedIndex = useMemo(
    () => filtered.findIndex((img) => img.id === selectedId),
    [filtered, selectedId],
  );
  const selected = useMemo(() => {
    if (!selectedId) return null;
    return filtered.find((img) => img.id === selectedId) ?? null;
  }, [filtered, selectedId]);

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
    const IMAGE_SYNC_ADVISORY_THRESHOLD = 150;
    if (images.length < IMAGE_SYNC_ADVISORY_THRESHOLD) return;
    if (syncRuntime.getActiveFolderName()) return;

    const advisoryKey = "bp-images-sync-advisory-shown";
    if (getLocalStorageFlag(advisoryKey)) return;
    setLocalStorageFlag(advisoryKey);
    toast("Large image library", {
      description:
        "You have many stored images. Connect a sync folder in Settings to reduce reload-loss risk.",
    });
  }, [images.length]);

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
  }, [selectByOffset, selected]);

  function handleChangeViewMode(mode: "library" | "deleted-imports") {
    if (mode === "deleted-imports") {
      setSelectedId(null);
      setPreviewOpen(false);
    }
    setViewMode(mode);
  }

  return (
    <PageLayout variant="panel" mobileDrawerOpen={Boolean(selectedId)} mobileDrawerSide="right">
      <PageLayout.Left>
        <ImagesLeftPanel
          total={filtered.length}
          steamSync={steamSync}
          viewMode={viewMode}
          sortMode={sortMode}
          onChangeViewMode={handleChangeViewMode}
          onChangeSortMode={setSortMode}
        />
      </PageLayout.Left>

      <PageLayout.Middle>
        {viewMode === "library" && filtered.length === 0 && (
          <EmptyState>
            <Text>No images yet. Add one from note capture or from a note editor.</Text>
          </EmptyState>
        )}

        {viewMode === "library" && filtered.length > 0 && (
          <ImagesGrid filtered={filtered} selectedId={selectedId} setSelectedId={setSelectedId} />
        )}

        {viewMode === "deleted-imports" && (
          <DeletedImportsList
            entries={filteredDeletedImports}
            busy={steamSync.busy}
            onUndelete={async (sourceKey, fileName) => {
              const restored = await steamSync.undeleteImport(sourceKey, fileName);
              if (restored) {
                setSelectedId(restored.id);
              }
              toast.success(`Re-enabled import for ${fileName}`);
            }}
            onHardDelete={async (sourceKey, fileName) => {
              try {
                await steamSync.hardDeleteImport(sourceKey);
                toast.success(`Permanently deleted ${fileName}`);
              } catch {
                toast.error(`Could not permanently delete ${fileName}`);
              }
            }}
            loadPreview={steamSync.loadDeletedImportPreview}
          />
        )}
      </PageLayout.Middle>

      <PageLayout.Right>
        {viewMode === "library" && (
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
              await steamSync.markDeletedByImageId(selected.id, selected.name);
              await removeImage(selected.id);
              const remaining = filtered.filter((img) => img.id !== selected.id);
              if (remaining.length === 0) {
                setSelectedId(null);
                return;
              }
              const nextIndex = Math.min(selectedIndex, remaining.length - 1);
              setSelectedId(remaining[nextIndex].id);
            }}
            onSaveLabel={async (label) => {
              if (!selected) return;
              const next = label.trim() || selected.name;
              if (next === getImageLabel(selected)) return;
              await updateImage({ ...selected, caption: next });
              toast.success("Image label updated");
            }}
          />
        )}

        {viewMode === "deleted-imports" && (
          <EmptyState>
            <Text>Select Library view to inspect active images.</Text>
          </EmptyState>
        )}
      </PageLayout.Right>
    </PageLayout>
  );
}

function DeletedImportsList({
  entries,
  busy,
  onUndelete,
  onHardDelete,
  loadPreview,
}: {
  entries: Array<{ sourceKey: string; fileName: string; deletedAt: number }>;
  busy: boolean;
  onUndelete: (sourceKey: string, fileName: string) => Promise<void>;
  onHardDelete: (sourceKey: string, fileName: string) => Promise<void>;
  loadPreview: (sourceKey: string) => Promise<Blob | null>;
}) {
  if (entries.length === 0) {
    return (
      <EmptyState>
        <Text>No deleted Steam imports found for this filter.</Text>
      </EmptyState>
    );
  }

  return (
    <Grid as="div" variant="gallery" gap="3">
      {entries.map((entry) => (
        <DeletedImportThumbCard
          key={entry.sourceKey}
          sourceKey={entry.sourceKey}
          fileName={entry.fileName}
          deletedAt={entry.deletedAt}
          busy={busy}
          onUndelete={onUndelete}
          onHardDelete={onHardDelete}
          loadPreview={loadPreview}
        />
      ))}
    </Grid>
  );
}

function useSteamSyncPanel(
  addImage: (blob: Blob, name?: string, caption?: string) => Promise<StoredImage>,
) {
  const [deletedImports, setDeletedImports] = useState<SteamDeletedImportEntry[]>([]);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const steamFolderSync = useSteamFolderSync({
    addImage,
    syncOnConnect: true,
    flushSyncRuntimeOnImport: true,
    syncEmptyMessage: "No new Steam screenshots found in connected folder",
  });

  async function refreshDeletedImports() {
    const entries = await loadSteamDeletedImports();
    setDeletedImports(entries);
  }

  useEffect(() => {
    void loadSteamDeletedImports().then((entries) => setDeletedImports(entries));
  }, []);

  async function markDeletedByImageId(imageId: string, fileName: string) {
    await markSteamImportedImageDeleted(imageId, fileName);
    await refreshDeletedImports();
  }

  async function undeleteImport(sourceKey: string) {
    const restored = await restoreDeletedSteamImportImage(sourceKey, addImage);
    await refreshDeletedImports();
    return restored;
  }

  async function hardDeleteImport(sourceKey: string) {
    if (steamFolderSync.busy || deleteBusy) return;
    setDeleteBusy(true);
    try {
      const imageIds = await getSteamImportedImageIdsForSource(sourceKey);
      for (const imageId of imageIds) {
        await removeImage(imageId);
      }
      await permanentlyDeleteSteamImport(sourceKey);
      await refreshDeletedImports();
    } finally {
      setDeleteBusy(false);
    }
  }

  async function loadDeletedImportPreview(sourceKey: string): Promise<Blob | null> {
    return loadSteamImportSourceBlob(sourceKey);
  }

  const steamSync: SteamSyncPanelModel = {
    supported: steamFolderSync.supported,
    connected: steamFolderSync.connected,
    folderName: steamFolderSync.folderName ?? getActiveSteamFolderName(),
    lastSyncAt: steamFolderSync.lastRefreshAt,
    deletedImports,
    busy: steamFolderSync.busy || deleteBusy,
    connect: steamFolderSync.connect,
    syncNow: steamFolderSync.syncNow,
    forceReimportAll: steamFolderSync.forceReimportAll,
    disconnect: steamFolderSync.disconnect,
    markDeletedByImageId,
    undeleteImport,
    hardDeleteImport,
    loadDeletedImportPreview,
  };

  return steamSync;
}

function ImagesGrid({
  filtered,
  selectedId,
  setSelectedId,
}: {
  filtered: StoredImage[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
}) {
  return (
    <Grid as="div" variant="gallery" gap="3">
      {filtered.map((img) => (
        <ImageThumb
          key={img.id}
          img={img}
          selected={img.id === selectedId}
          onClick={() => {
            setSelectedId(img.id);
          }}
        />
      ))}
    </Grid>
  );
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
  return (
    <ImageThumbButton
      imageId={img.id}
      imageName={img.name}
      label={getImageLabel(img)}
      selected={selected}
      onClick={onClick}
    />
  );
}

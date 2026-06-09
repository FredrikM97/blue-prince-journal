import { useState } from "react";
import { toast } from "sonner";
import { importAll } from "@/data/storage/backup";
import { getLocalJournalItemCount } from "@/data/welcome";
import { connectSyncFolderWithConflictResolution, syncRuntime } from "@/data/sync/sync";
import { startFresh } from "@/data/mutations/lifecycleMutations";
import type { SyncConflictChoice } from "@/data/sync/sync";

export function useWelcomeScreenActions({
  onDone,
}: {
  onDone: (syncFolderName?: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [conflictResolve, setConflictResolve] = useState<
    ((choice: SyncConflictChoice) => void) | null
  >(null);

  function openConflictDialog(): Promise<SyncConflictChoice> {
    return new Promise((resolve) => {
      setConflictResolve(() => resolve);
    });
  }

  function handleConflictChoice(choice: SyncConflictChoice) {
    setConflictResolve(null);
    conflictResolve?.(choice);
  }

  async function handleStartFresh() {
    setBusy(true);
    try {
      await startFresh();
      toast.success("Started fresh");
      onDone();
    } catch {
      toast.error("Could not reset existing data");
    } finally {
      setBusy(false);
    }
  }

  async function handleConnectFolder() {
    setBusy(true);
    try {
      const localItemsCount = await getLocalJournalItemCount();
      const connectResult = await connectSyncFolderWithConflictResolution(
        localItemsCount,
        openConflictDialog,
      );
      if (!connectResult) {
        return;
      }

      if (connectResult.resolution === "connected-empty") {
        toast.success(
          `Connected to "${connectResult.handle.name}" - data will sync here automatically`,
        );
      }
      if (connectResult.resolution === "use-folder-data") {
        toast.success(`Using folder data from "${connectResult.handle.name}"`);
      }
      if (connectResult.resolution === "keep-local-data") {
        toast.success(`Keeping local data and syncing to "${connectResult.handle.name}"`);
      }
      onDone(syncRuntime.getActiveFolderName() ?? connectResult.handle.name);
    } catch (err) {
      const message = err instanceof Error ? err.message.toLowerCase() : "";
      if (message.includes("system files") || message.includes("sensitive")) {
        toast.error("That folder is restricted by the browser. Pick a normal folder instead.");
      } else {
        toast.error("Could not connect to folder");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(file: File) {
    try {
      await importAll(file, "replace");
      toast.success("Data imported");
      onDone();
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return {
    busy,
    conflictResolve,
    handleConflictChoice,
    handleStartFresh,
    handleConnectFolder,
    handleImport,
  };
}

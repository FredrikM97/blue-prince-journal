import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { syncRuntime } from "@/data/sync/sync";
import { getLocalStorageFlag, setLocalStorageFlag } from "@/data/storage/storageHealth";
import { db, ensureBootSeed } from "@/data/db";
import { cleanupOrphanedImageRefs } from "@/data/mutations/imageMutations";
import { useStore } from "@/hooks/useStore";

type InitState = "checking" | "welcome" | "ready";
type WelcomeSource = "auto" | "manual" | null;

export function useAppFrameInit({
  noteCount,
  todoCount,
}: {
  noteCount: number;
  todoCount: number;
}) {
  const setLoaded = useStore((s) => s.setLoaded);
  const setSyncFolderName = useStore((s) => s.setSyncFolderName);
  const [initState, setInitState] = useState<InitState>("checking");
  const [welcomeSource, setWelcomeSource] = useState<WelcomeSource>(null);

  useEffect(() => {
    async function init() {
      try {
        await ensureBootSeed();
        await cleanupOrphanedImageRefs();
        setLoaded(true);

        const initialNoteCount = await db.notes.count();
        const initialTodoCount = await db.todos.count();
        const localIsEmpty = initialNoteCount === 0 && initialTodoCount === 0;
        const { folderName } = await syncRuntime.boot(localIsEmpty);
        if (folderName) setSyncFolderName(folderName);

        const welcomed = getLocalStorageFlag("bp-welcomed");
        const hasData = initialNoteCount > 0 || initialTodoCount > 0;
        const hasSyncFolder = Boolean(syncRuntime.getActiveFolderName());

        if (!welcomed && !hasData && !hasSyncFolder) {
          setWelcomeSource("auto");
          setInitState("welcome");
          return;
        }

        setLocalStorageFlag("bp-welcomed");
        setWelcomeSource(null);
        setInitState("ready");
      } catch {
        setInitState("ready");
        toast.error(
          "Browser storage access is limited. Recent changes may not persist after refresh.",
        );
      }
    }

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function showWelcome() {
      setWelcomeSource("manual");
      setInitState("welcome");
    }
    window.addEventListener("bp:show-welcome", showWelcome);
    return () => window.removeEventListener("bp:show-welcome", showWelcome);
  }, []);

  const shouldAutoDismissWelcome =
    initState === "welcome" && welcomeSource === "auto" && (noteCount > 0 || todoCount > 0);

  useEffect(() => {
    if (!shouldAutoDismissWelcome) return;
    setLocalStorageFlag("bp-welcomed");
  }, [shouldAutoDismissWelcome]);

  const continueWelcome = useCallback(() => {
    setWelcomeSource(null);
    setInitState("ready");
  }, []);

  const completeWelcome = useCallback(
    (folderName?: string) => {
      if (folderName) setSyncFolderName(folderName);
      setLocalStorageFlag("bp-welcomed");
      setWelcomeSource(null);
      setInitState("ready");
    },
    [setSyncFolderName],
  );

  return {
    effectiveInitState: shouldAutoDismissWelcome ? "ready" : initState,
    continueWelcome,
    completeWelcome,
  } as const;
}
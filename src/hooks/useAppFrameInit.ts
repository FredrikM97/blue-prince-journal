import { useEffect } from "react";
import { toast } from "sonner";
import { db, ensureBootSeed } from "@/data/db";
import { cleanupOrphanedImageRefs } from "@/data/mutations/imageMutations";
import { syncRuntime } from "@/data/sync/sync";
import { useStore } from "@/hooks/useStore";

export function useAppFrameInit() {
  const setLoaded = useStore((s) => s.setLoaded);
  const setSyncFolderName = useStore((s) => s.setSyncFolderName);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Initialization runs once when the frame mounts.
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
      } catch {
        toast.error(
          "Browser storage access is limited. Recent changes may not persist after refresh.",
        );
      }
    }

    void init();
  }, []);
}

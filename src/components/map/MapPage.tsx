import { useMemo, useState } from "react";
import { PageLayout } from "@/components/common/PageLayout";
import { MapLeftPanel } from "./MapLeftPanel";
import { MapMiddlePanel } from "./MapMiddlePanel";
import { MapRightPanel } from "./MapRightPanel";
import { GRID_ROWS, cellId } from "@/data/rooms";
import { useStore } from "@/data/store";
import { db } from "@/data/db";
import { upsertCell, clearCell } from "@/data/mutations";
import type { GridCell, Note, Todo } from "@/lib/types";
import { MetaText } from "@/components/common/Typography";
import { SidePanel } from "@/components/common/SidePanel";
import { Stack } from "@/components/common/Stack";
import { useLiveQueryArray } from "@/hooks/useLiveQueryArray";

const COL_LABELS = ["A", "B", "C", "D", "E"] as const;

function coordLabel(row: number, col: number) {
  return `${COL_LABELS[col] ?? String(col + 1)}${GRID_ROWS - row}`;
}

const STATUS_COLOR: Record<GridCell["status"], string> = {
  unknown: "map-cell-neutral",
  drafted: "map-cell-neutral",
  explored: "map-cell-neutral",
  cleared: "map-cell-cleared",
};

type ActiveCellCoord = { row: number; col: number };

export function MapPage() {
  const gridCells: GridCell[] = useLiveQueryArray(() => db.grid.toArray());
  const notes: Note[] = useLiveQueryArray(() => db.notes.toArray());
  const todos: Todo[] = useLiveQueryArray(() => db.todos.toArray());
  const openCapture = useStore((s) => s.openCapture);
  const [active, setActive] = useState<ActiveCellCoord | null>(null);

  const byId = useMemo(() => {
    const m = new Map<string, GridCell>();
    gridCells.forEach((c) => m.set(c.id, c));
    return m;
  }, [gridCells]);

  const activeCell = active ? byId.get(cellId(active.row, active.col)) : undefined;
  const activeRoom = activeCell?.roomName;
  const activeNotes = activeRoom ? notes.filter((n) => n.room === activeRoom) : [];
  const activeTodos = activeRoom ? todos.filter((t) => t.room === activeRoom) : [];

  const noteCountByRoom = useMemo(() => {
    const counts = new Map<string, number>();
    for (const note of notes) {
      if (!note.room) continue;
      counts.set(note.room, (counts.get(note.room) ?? 0) + 1);
    }
    return counts;
  }, [notes]);

  const [commentDraft, setCommentDraft] = useState("");

  function openCell(row: number, col: number) {
    setActive({ row, col });
    const c = byId.get(cellId(row, col));
    setCommentDraft(c?.comment ?? "");
  }

  let rightSidebar = (
    <SidePanel.Right title="Preview" onClose={() => setActive(null)}>
      <Stack gap="4">
        <MetaText>Select a map cell to edit room details, notes, and todos.</MetaText>
      </Stack>
    </SidePanel.Right>
  );
  if (active) {
    rightSidebar = (
      <MapRightPanel
        row={active.row}
        col={active.col}
        coordLabel={coordLabel(active.row, active.col)}
        activeCell={activeCell}
        activeNotes={activeNotes}
        activeTodos={activeTodos}
        commentDraft={commentDraft}
        setCommentDraft={setCommentDraft}
        onClose={() => {
          setActive(null);
        }}
        upsertCell={upsertCell}
        clearCell={clearCell}
        openCapture={openCapture}
      />
    );
  }

  return (
    <PageLayout variant="panel" mobileDrawerOpen={Boolean(active)} mobileDrawerSide="right">
      <PageLayout.Left>
        <MapLeftPanel />
      </PageLayout.Left>
      <PageLayout.Middle>
        <MapMiddlePanel
          byId={byId}
          noteCountByRoom={noteCountByRoom}
          statusColor={STATUS_COLOR}
          coordLabel={coordLabel}
          onOpenCell={openCell}
        />
      </PageLayout.Middle>
      <PageLayout.Right>{rightSidebar}</PageLayout.Right>
    </PageLayout>
  );
}

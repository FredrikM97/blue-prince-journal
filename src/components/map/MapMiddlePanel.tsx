import { GRID_COLS, GRID_ROWS, cellId } from "@/data/rooms";
import type { GridCell } from "@/lib/types";
import { Button } from "@/components/common/Button";

interface MapMiddlePanelProps {
  byId: Map<string, GridCell>;
  noteCountByRoom: Map<string, number>;
  statusColor: Record<GridCell["status"], string>;
  coordLabel: (row: number, col: number) => string;
  onOpenCell: (row: number, col: number) => void;
}

export function MapMiddlePanel({
  byId,
  noteCountByRoom,
  statusColor,
  coordLabel,
  onOpenCell,
}: MapMiddlePanelProps) {
  return (
    <div className="map-layout-main">
      <div
        className="map-grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: GRID_ROWS }).flatMap((_, row) =>
          Array.from({ length: GRID_COLS }).map((__, col) => {
            const cell = byId.get(cellId(row, col));
            const status = cell?.status === "cleared" ? "cleared" : "unknown";
            const roomNoteCount = cell?.roomName ? (noteCountByRoom.get(cell.roomName) ?? 0) : 0;
            return (
              <Button
                key={`${row},${col}`}
                type="button"
                variant="ghost"
                size="content"
                direction="column"
                onClick={() => onOpenCell(row, col)}
                className={`map-cell ${statusColor[status]}`}
              >
                {cell?.roomName ? (
                  <>
                    <span className="map-cell-room-name">{cell.roomName}</span>
                    {(cell.comment || roomNoteCount > 0) && (
                      <span className="map-cell-meta">
                        {cell.comment && "💬"}
                        {roomNoteCount > 0 && ` 📝${roomNoteCount}`}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="map-cell-coord">{coordLabel(row, col)}</span>
                )}
              </Button>
            );
          }),
        )}
      </div>
    </div>
  );
}

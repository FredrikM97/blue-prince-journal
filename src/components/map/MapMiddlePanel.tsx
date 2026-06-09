import { GRID_COLS, GRID_ROWS, cellId } from "@/data/rooms/rooms";
import { Grid } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { Text } from "@/components/common/Typography";
import { MapCellButton } from "./MapCellButton";
import type { GridCell } from "@/lib/types";

interface MapMiddlePanelProps {
  byId: Map<string, GridCell>;
  noteCountByRoom: Map<string, number>;
  statusColor?: Record<GridCell["status"], string>;
  coordLabel: (row: number, col: number) => string;
  onOpenCell: (row: number, col: number) => void;
  activeCell: { row: number; col: number } | null;
}

export function MapMiddlePanel({
  byId,
  noteCountByRoom,
  coordLabel,
  onOpenCell,
  activeCell,
}: MapMiddlePanelProps) {
  return (
    <Stack className="map-layout-main" gap="0">
      <Grid as="div" gap="2" className="map-grid">
        {Array.from({ length: GRID_ROWS }).flatMap((_, row) =>
          Array.from({ length: GRID_COLS }).map((__, col) => {
            const cell = byId.get(cellId(row, col));
            let status: "neutral" | "cleared" = "neutral";
            if (cell?.status === "cleared") {
              status = "cleared";
            }
            const roomNoteCount = cell?.roomName ? (noteCountByRoom.get(cell.roomName) ?? 0) : 0;
            const roomDisplayName = cell?.roomName ? cell.roomName.replace(/\s+/g, "\n") : "";
            let isSelected = false;
            if (activeCell && activeCell.row === row && activeCell.col === col) {
              isSelected = true;
            }

            let cellBody = (
              <Text as="span" className="map-cell-coord" size="xs">
                {coordLabel(row, col)}
              </Text>
            );
            if (cell?.roomName) {
              cellBody = (
                <>
                  <Text as="span" className="map-cell-room-name" size="xs" leading="tight">
                    {roomDisplayName}
                  </Text>
                  {(cell.comment || roomNoteCount > 0) && (
                    <Text as="span" className="map-cell-meta" size="xs">
                      {cell.comment && "💬"}
                      {roomNoteCount > 0 && ` 📝${roomNoteCount}`}
                    </Text>
                  )}
                </>
              );
            }

            return (
              <MapCellButton
                key={`${row},${col}`}
                status={status}
                selected={isSelected}
                onClick={() => onOpenCell(row, col)}
              >
                {cellBody}
              </MapCellButton>
            );
          }),
        )}
      </Grid>
    </Stack>
  );
}

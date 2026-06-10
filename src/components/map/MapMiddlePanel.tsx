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
    <Stack
      className="flex h-full min-h-0 flex-col items-center justify-start pt-0 max-[63.99rem]:justify-center max-[63.99rem]:pb-[4.5rem]"
      gap="0"
    >
      <Grid
        as="div"
        gap="2"
        className="mx-auto grid grid-cols-5 gap-2.5 w-[min(100%,calc((100dvh-var(--map-grid-height-offset))*5/9))] max-[63.99rem]:gap-2 max-[40rem]:gap-1.5 [--map-grid-height-offset:7.5rem] max-[63.99rem]:[--map-grid-height-offset:12rem] max-[40rem]:[--map-grid-height-offset:12.5rem]"
      >
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
              <Text as="span" className="text-[9px] opacity-50 sm:text-[10px] max-[40rem]:text-[9px]" size="xs">
                {coordLabel(row, col)}
              </Text>
            );
            if (cell?.roomName) {
              cellBody = (
                <>
                  <Text
                    as="span"
                    className="block w-full overflow-hidden whitespace-pre-line break-normal text-[9px] leading-tight [hyphens:none] [overflow-wrap:normal] [word-break:normal] sm:text-[10px] max-[40rem]:text-[9px] max-[40rem]:leading-[1.15]"
                    size="xs"
                    leading="tight"
                  >
                    {roomDisplayName}
                  </Text>
                  {(cell.comment || roomNoteCount > 0) && (
                    <Text
                      as="span"
                      className="inline-flex items-center gap-0.5 whitespace-nowrap text-[8px] leading-tight opacity-80 sm:text-[9px] max-[40rem]:text-[9px]"
                      size="xs"
                    >
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

import { Button } from "@/components/common/Button";
import { useNavigate } from "@tanstack/react-router";
import { PagedNotesList } from "@/components/map/PagedNotesList";
import { RoomDropdown } from "@/components/common/dropdown/RoomDropdown";
import { InputField } from "@/components/common/input/InputField";
import { SuggestionsDropdown } from "@/components/common/suggestions/SuggestionsDropdown";
import { Eraser, Trash2 } from "lucide-react";
import type { GridCell, Note, Todo } from "@/lib/types";
import { Inline } from "@/components/common/LayoutPrimitives";
import { SidePanelRight } from "@/components/common/SidePanel";
import { Stack } from "@/components/common/general/Stack";
import { MetaText, Text } from "@/components/common/Typography";

export interface MapRightPanelProps {
  coordLabel: string;
  activeCell: GridCell | undefined;
  activeNotes: Note[];
  activeTodos: Todo[];
  commentDraft: string;
  setCommentDraft: (next: string) => void;
  onClose: () => void;
  upsertCell: (cell: Partial<GridCell> & { row: number; col: number }) => Promise<void>;
  clearCell: (row: number, col: number) => Promise<void>;
  openCapture: (opts?: {
    kind?: "note" | "todo";
    prefill?: string;
    room?: string;
    returnTo?: string;
  }) => void;
  row: number;
  col: number;
}

export function MapRightPanel({
  coordLabel,
  activeCell,
  activeNotes,
  activeTodos,
  commentDraft,
  setCommentDraft,
  onClose,
  upsertCell,
  clearCell,
  openCapture,
  row,
  col,
}: MapRightPanelProps) {
  const navigate = useNavigate();
  const activeRoom = activeCell?.roomName;
  let panelTitle = `Cell ${coordLabel}`;
  if (activeCell?.roomName) panelTitle = activeCell.roomName;

  async function openCaptureFromMap(kind: "note" | "todo") {
    if (!activeRoom) return;
    await navigate({ to: "/notes" });
    openCapture({ kind, room: activeRoom, returnTo: "/map" });
  }

  return (
    <SidePanelRight title={panelTitle} onClose={onClose} panelKey={`map:${coordLabel}`}>
      <Stack gap="4">
        <Stack gap="1">
          <MetaText>Room</MetaText>
          <RoomDropdown
            value={activeRoom}
            onValueChange={(roomName) => {
              void upsertCell({ row, col, roomName: roomName || undefined });
            }}
          />
        </Stack>

        <Stack gap="1">
          <SuggestionsDropdown>
            <InputField
              value={commentDraft}
              onChange={setCommentDraft}
              onBlur={() => upsertCell({ row, col, comment: commentDraft })}
              label="Cell details"
              showOptionalHint={false}
              rows={6}
              markdown
              placeholder="Quick note about this cell - door direction, gem cost, danger..."
            />
          </SuggestionsDropdown>
          <MetaText>Markdown supported: headings, lists, checkboxes, bold, italic, code.</MetaText>
        </Stack>

        {activeRoom && (
          <Inline gap="2" align="center">
            <Button
              variant="brass"
              size="sm"
              fullWidth
              onClick={() => {
                void openCaptureFromMap("note");
              }}
            >
              + Note (image)
            </Button>
            <Button
              variant="outline"
              size="sm"
              fullWidth
              onClick={() => {
                void openCaptureFromMap("todo");
              }}
            >
              + Todo
            </Button>
          </Inline>
        )}

        <Inline gap="2" align="center">
          <Button
            variant="ghost"
            tone="muted"
            onClick={() => {
              setCommentDraft("");
              upsertCell({ row, col, comment: "" });
            }}
          >
            <Eraser /> Clear comment
          </Button>
          <Button
            variant="ghost"
            tone="destructive"
            onClick={() => {
              clearCell(row, col);
              onClose();
            }}
          >
            <Trash2 /> Clear cell
          </Button>
        </Inline>

        {activeNotes.length > 0 && (
          <PagedNotesList key={`${row}-${col}`} notes={activeNotes} title="Notes in this room" />
        )}
        {activeTodos.length > 0 && <MapRoomTodos todos={activeTodos} />}
      </Stack>
    </SidePanelRight>
  );
}

function MapRoomTodos({ todos }: { todos: Todo[] }) {
  return (
    <Stack gap="2">
      <MetaText>Todo items in this room</MetaText>
      <Stack as="ul" gap="1">
        {todos.map((todo) => {
          return (
            <Text
              key={todo.id}
              as="li"
              size="sm"
              tone={todo.status === "done" ? "muted" : "default"}
              decoration={todo.status === "done" ? "line-through" : "none"}
            >
              · {todo.title}
            </Text>
          );
        })}
      </Stack>
    </Stack>
  );
}

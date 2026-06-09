import { useMemo, useState } from "react";
import { addCustomRoom, getAllRoomGroups, listCustomRooms, removeCustomRoom, ROOM_GROUPS, type RoomCategory } from "@/data/rooms/rooms";
import { Button } from "@/components/common/Button";
import { DropdownSelect } from "@/components/common/dropdown/DropdownSelect";
import { InputField } from "@/components/common/input/InputField";
import { Inline, SectionBlock } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { Heading, MetaText } from "@/components/common/Typography";
import { toast } from "sonner";
import { SettingsSection } from "./SettingsSection";

export function SettingsRoomsSection() {
  const [customRooms, setCustomRooms] = useState(() => listCustomRooms());
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomCategory, setNewRoomCategory] = useState<RoomCategory>(ROOM_GROUPS[0]);

  const customRoomsByCategory = useMemo(() => {
    const allGroups = getAllRoomGroups();
    const grouped = new Map<string, string[]>();
    allGroups.forEach((group) => grouped.set(group, []));
    customRooms.forEach((room) => {
      if (!grouped.has(room.category)) grouped.set(room.category, []);
      grouped.get(room.category)!.push(room.name);
    });
    return grouped;
  }, [customRooms]);

  const categoryOptions = useMemo(
    () => [...customRoomsByCategory.keys()].map((g) => ({ value: g, label: g })),
    [customRoomsByCategory],
  );

  function addRoom() {
    const roomName = newRoomName.trim();
    if (!roomName) return;
    const next = addCustomRoom(roomName, newRoomCategory);
    setCustomRooms(next);
    setNewRoomName("");
    toast.success("Room added");
  }

  function removeRoom(name: string) {
    const next = removeCustomRoom(name);
    setCustomRooms(next);
    toast.success("Room removed");
  }

  return (
    <SectionBlock>
      <SettingsSection title="Rooms">
        <MetaText>
          Add custom rooms under any group. They appear in Map, New Note, and Edit Note room
          dropdowns.
        </MetaText>

        <Inline gap="2" wrap align="end">
          <InputField value={newRoomName} onChange={setNewRoomName} placeholder="New room name" grow />

          <DropdownSelect
            value={newRoomCategory}
            onValueChange={(value) => setNewRoomCategory(value as RoomCategory)}
            options={categoryOptions}
          />

          <Button size="sm" variant="outline" onClick={addRoom}>
            Add room
          </Button>
        </Inline>

        <Stack gap="3" variant="panel-card">
          {[...customRoomsByCategory.entries()].map(([group, rooms]) => {
            if (rooms.length === 0) return null;

            return (
              <Stack key={group} gap="2">
                <Heading as="h3" size="base" variant="section-label">
                  {group}
                </Heading>
                <Inline gap="1.5" wrap>
                  {rooms.map((name) => (
                    <Button
                      key={`${group}-${name}`}
                      type="button"
                      size="sm"
                      variant="outline-destructive"
                      onClick={() => removeRoom(name)}
                      title="Remove room"
                    >
                      {name}
                    </Button>
                  ))}
                </Inline>
              </Stack>
            );
          })}
          {customRooms.length === 0 && <MetaText>No custom rooms yet.</MetaText>}
        </Stack>
      </SettingsSection>
    </SectionBlock>
  );
}

import { useMemo } from "react";
import { FilterSection } from "@/components/common/filter/FilterSection";
import { FilterToggleGrid } from "@/components/common/filter/FilterToggleGrid";
import { Stack } from "@/components/common/general/Stack";
import { getRoomCatalog, ROOM_GROUPS } from "@/data/rooms/rooms";

interface GroupedRooms {
  name: string;
  rooms: string[];
}

function buildGroupedRooms(rooms: string[]): GroupedRooms[] {
  const grouped = new Map<string, string[]>();
  for (const group of ROOM_GROUPS) {
    grouped.set(group, []);
  }
  grouped.set("Ungrouped", []);

  const roomCategoryByName = new Map<string, string>();
  const catalog = getRoomCatalog();
  for (const room of catalog) {
    roomCategoryByName.set(room.name.toLowerCase(), String(room.category));
  }

  for (const room of rooms) {
    if (room === "") {
      const ungrouped = grouped.get("Ungrouped");
      if (ungrouped) ungrouped.push(room);
      continue;
    }

    const category = roomCategoryByName.get(room.toLowerCase());
    if (!category) {
      const ungrouped = grouped.get("Ungrouped");
      if (ungrouped) ungrouped.push(room);
      continue;
    }

    const known = grouped.get(category);
    if (known) {
      known.push(room);
      continue;
    }

    const fallback = grouped.get("Ungrouped");
    if (fallback) fallback.push(room);
  }

  const result: GroupedRooms[] = [];
  grouped.forEach((groupRooms, name) => {
    if (groupRooms.length === 0) return;
    result.push({
      name,
      rooms: [...groupRooms].sort((a, b) => a.localeCompare(b)),
    });
  });
  return result;
}

export function GroupedRoomFilterSection({
  rooms,
  isRoomActive,
  onToggleRoom,
  onResetAll,
  title = "Rooms",
  defaultOpen = false,
}: {
  rooms: string[];
  isRoomActive: (room: string) => boolean;
  onToggleRoom: (room: string) => void;
  onResetAll?: () => void;
  title?: string;
  defaultOpen?: boolean;
}) {
  const groupedRoomFilters = useMemo(() => buildGroupedRooms(rooms), [rooms]);

  const inactiveCount = useMemo(() => {
    let count = 0;
    for (const room of rooms) {
      if (!isRoomActive(room)) {
        count += 1;
      }
    }
    return count;
  }, [isRoomActive, rooms]);

  let badge: string | undefined = undefined;
  if (inactiveCount > 0) {
    badge = `(${rooms.length - inactiveCount}/${rooms.length})`;
  }

  if (rooms.length === 0) return null;

  return (
    <FilterSection
      title={title}
      collapsible
      defaultOpen={defaultOpen}
      width="fit"
      variant="compact"
      badge={badge}
      onReset={onResetAll}
    >
      <Stack gap="2">
        {groupedRoomFilters.map((group) => {
          const inactiveInGroup = group.rooms.filter((room) => !isRoomActive(room)).length;

          let groupBadge: string | undefined = undefined;
          if (inactiveInGroup > 0) {
            groupBadge = `(${group.rooms.length - inactiveInGroup}/${group.rooms.length})`;
          }

          let onResetGroup: (() => void) | undefined = undefined;
          if (inactiveInGroup > 0) {
            onResetGroup = () => {
              for (const room of group.rooms) {
                if (isRoomActive(room)) continue;
                onToggleRoom(room);
              }
            };
          }

          const groupItems = group.rooms.map((room) => {
            let label = room;
            if (!label) {
              label = "Ungrouped";
            }

            let key = room;
            if (!key) {
              key = "__ungrouped__";
            }

            return {
              key,
              label,
              active: isRoomActive(room),
              onToggle: () => onToggleRoom(room),
            };
          });

          return (
            <FilterSection
              key={group.name}
              title={group.name}
              collapsible
              defaultOpen={false}
              width="fit"
              variant="compact"
              badge={groupBadge}
              onReset={onResetGroup}
            >
              <FilterToggleGrid
                items={groupItems}
                leftAligned
                size="compact"
                layout="wrap"
                width="fit"
                activeStyle="filled"
              />
            </FilterSection>
          );
        })}
      </Stack>
    </FilterSection>
  );
}

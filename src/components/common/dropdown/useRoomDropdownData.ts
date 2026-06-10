import { useCallback, useMemo, useState } from "react";
import {
  addCustomRoom,
  getAllRoomGroups,
  getGroupedRoomCatalog,
  type RoomCategory,
  type RoomDef,
} from "@/data/rooms/rooms";

type RoomSearchResult = {
  name: string;
  category: string;
};

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
}

export function useRoomDropdownData({
  value,
  onValueChange,
}: {
  value?: string;
  onValueChange: (next: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [catalogVersion, setCatalogVersion] = useState(0);

  const catalog = useMemo(() => {
    void catalogVersion;
    return {
      groupedRooms: getGroupedRoomCatalog(),
      allGroups: getAllRoomGroups(),
    };
  }, [catalogVersion]);

  const { groupedRooms, allGroups } = catalog;

  const roomCategoryByName = useMemo(() => {
    const categoryByName = new Map<string, string>();
    allGroups.forEach((group) => {
      groupedRooms[group]?.forEach((room) => {
        if (!categoryByName.has(room.name)) categoryByName.set(room.name, group);
      });
    });
    return categoryByName;
  }, [groupedRooms, allGroups]);

  const activeRoom = value?.trim() ? value.trim() : "";
  const activeCategory = activeRoom ? (roomCategoryByName.get(activeRoom) ?? null) : null;

  const slashIdx = query.indexOf("/");
  const hasSlash = slashIdx !== -1;
  const groupRaw = hasSlash ? query.slice(0, slashIdx).trim() : "";
  const roomRaw = hasSlash ? query.slice(slashIdx + 1).trim() : query.trim();
  const groupQuery = groupRaw.toLowerCase();
  const roomQuery = roomRaw.toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();

  const searchResults = useMemo<RoomSearchResult[]>(() => {
    if (!normalizedQuery) return [];

    const results: RoomSearchResult[] = [];
    allGroups.forEach((group) => {
      if (hasSlash && groupQuery && !group.toLowerCase().includes(groupQuery)) return;
      const term = hasSlash ? roomQuery : normalizedQuery;
      groupedRooms[group]?.forEach((room) => {
        if (!term || room.name.toLowerCase().includes(term)) {
          results.push({ name: room.name, category: group });
        }
      });
    });

    return results;
  }, [allGroups, groupQuery, groupedRooms, hasSlash, normalizedQuery, roomQuery]);

  const targetGroup: RoomCategory = hasSlash ? toTitleCase(groupRaw) || "Custom Rooms" : "Custom Rooms";
  const targetRoom = roomRaw;

  const exactMatchExists = useMemo(
    () =>
      targetRoom
        ? allGroups.some((group) =>
            groupedRooms[group]?.some(
              (room: RoomDef) => room.name.toLowerCase() === targetRoom.toLowerCase(),
            ),
          )
        : true,
    [allGroups, groupedRooms, targetRoom],
  );

  const showAddOption = targetRoom.length > 0 && !exactMatchExists;

  const handleAddCustomRoom = useCallback(() => {
    if (!targetRoom) return;
    addCustomRoom(targetRoom, targetGroup);
    setCatalogVersion((version) => version + 1);
    onValueChange(targetRoom);
  }, [onValueChange, targetGroup, targetRoom]);

  return {
    query,
    setQuery,
    resetQuery: () => setQuery(""),
    groupedRooms,
    allGroups,
    activeRoom,
    activeCategory,
    normalizedQuery,
    searchResults,
    showAddOption,
    targetRoom,
    targetGroup,
    handleAddCustomRoom,
  };
}

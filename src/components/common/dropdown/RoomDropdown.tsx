/**
 * RoomDropdown — room picker with live search and grouped sub-menus by category.
 * Rooms are grouped under sub-menus (e.g. Ground Floor, Upper Floor) when not filtering.
 * Typing in the search box flattens results across all groups.
 */

import { memo, useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/common/dropdown/DropdownMenu";
import { addCustomRoom, getAllRoomGroups, getGroupedRoomCatalog } from "@/data/rooms";
import { MetaText } from "@/components/common/Typography";
import { DropdownTriggerButton } from "@/components/common/dropdown/SelectTriggerButton";

function toTitleCase(s: string) {
  return s.toLowerCase().replace(/(?:^|\s)\S/g, (c) => c.toUpperCase());
}

function RoomDropdownComponent({
  value,
  onValueChange,
  placeholder = "Pick a room...",
  clearLabel = "No room",
}: {
  value?: string;
  onValueChange: (next: string) => void;
  placeholder?: string;
  clearLabel?: string;
}) {
  const [query, setQuery] = useState("");
  const [catalogVersion, setCatalogVersion] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const { groupedRooms, allGroups } = useMemo(() => {
    // catalogVersion is intentionally used to bust the module-level cache after
    // addCustomRoom mutates localStorage (the functions read fresh data each call).
    void catalogVersion;
    return { groupedRooms: getGroupedRoomCatalog(), allGroups: getAllRoomGroups() };
  }, [catalogVersion]);
  const roomCategoryByName = useMemo(() => {
    const map = new Map<string, string>();
    allGroups.forEach((group) => {
      groupedRooms[group]?.forEach((room) => {
        if (!map.has(room.name)) map.set(room.name, group);
      });
    });
    return map;
  }, [groupedRooms, allGroups]);

  const activeRoom = value?.trim() ? value.trim() : "";
  const activeCategory = activeRoom ? (roomCategoryByName.get(activeRoom) ?? null) : null;

  // Slash syntax: "group/room" scopes the search and sets the target group for new rooms.
  const slashIdx = query.indexOf("/");
  const hasSlash = slashIdx !== -1;
  const groupRaw = hasSlash ? query.slice(0, slashIdx).trim() : "";
  const roomRaw = hasSlash ? query.slice(slashIdx + 1).trim() : query.trim();
  const groupQuery = groupRaw.toLowerCase();
  const roomQuery = roomRaw.toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();

  const searchResults: Array<{ name: string; category: string }> = [];
  if (normalizedQuery) {
    allGroups.forEach((group) => {
      if (hasSlash && groupQuery && !group.toLowerCase().includes(groupQuery)) return;
      const term = hasSlash ? roomQuery : normalizedQuery;
      groupedRooms[group]?.forEach((room) => {
        if (!term || room.name.toLowerCase().includes(term)) {
          searchResults.push({ name: room.name, category: group });
        }
      });
    });
  }

  const targetGroup = hasSlash ? toTitleCase(groupRaw) || "Custom Rooms" : "Custom Rooms";
  const targetRoom = roomRaw;
  const exactMatchExists = targetRoom
    ? allGroups.some((g) =>
        groupedRooms[g]?.some((r) => r.name.toLowerCase() === targetRoom.toLowerCase()),
      )
    : true;
  const showAddOption = targetRoom.length > 0 && !exactMatchExists;

  function handleAddCustomRoom() {
    if (!targetRoom) return;
    addCustomRoom(targetRoom, targetGroup);
    setCatalogVersion((v) => v + 1);
    onValueChange(targetRoom);
  }

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) setQuery("");
        if (nextOpen) requestAnimationFrame(() => searchRef.current?.focus());
      }}
    >
      <DropdownMenuTrigger asChild>
        <DropdownTriggerButton
          valueLabel={activeRoom || undefined}
          placeholder={placeholder}
          hasValue={!!activeRoom}
          variant="room"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" variant="select">
        <div className="px-1 pb-1">
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Search rooms..."
            className="room-dropdown-search"
          />
        </div>

        {(() => {
          let clearTone: "default" | "active" = "default";
          if (!activeRoom) clearTone = "active";
          return (
            <DropdownMenuItem tone={clearTone} onSelect={() => onValueChange("")}>
              {clearLabel}
            </DropdownMenuItem>
          );
        })()}

        {normalizedQuery && (
          <>
            {searchResults.map((room) => {
              let itemTone: "default" | "active" = "default";
              if (room.name === activeRoom) itemTone = "active";
              return (
                <DropdownMenuItem
                  key={`${room.category}-${room.name}`}
                  tone={itemTone}
                  onSelect={() => onValueChange(room.name)}
                >
                  <div className="flex min-w-0 flex-col">
                    <span>{room.name}</span>
                    <MetaText as="span" truncate>
                      {room.category}
                    </MetaText>
                  </div>
                </DropdownMenuItem>
              );
            })}
            {showAddOption && (
              <DropdownMenuItem onSelect={handleAddCustomRoom}>
                <Plus className="icon-md shrink-0" />
                <MetaText as="span" size="sm">
                  Add "{targetRoom}" to {targetGroup}
                </MetaText>
              </DropdownMenuItem>
            )}
            {!showAddOption && searchResults.length === 0 && (
              <div className="room-dropdown-empty">No matching rooms</div>
            )}
          </>
        )}

        {!normalizedQuery &&
          allGroups
            .filter((group) => (groupedRooms[group]?.length ?? 0) > 0)
            .map((group) => (
              <DropdownMenuSub key={group}>
                <DropdownMenuSubTrigger>
                  <div className="flex min-w-0 flex-col">
                    <span>{group}</span>
                    {activeCategory === group && activeRoom && (
                      <MetaText as="span" truncate>
                        {activeRoom}
                      </MetaText>
                    )}
                  </div>
                </DropdownMenuSubTrigger>

                <DropdownMenuSubContent className="room-submenu-content">
                  {groupedRooms[group]?.map((room) => {
                    let itemTone: "default" | "active" = "default";
                    if (room.name === activeRoom) itemTone = "active";
                    return (
                      <DropdownMenuItem
                        key={room.name}
                        tone={itemTone}
                        onSelect={() => onValueChange(room.name)}
                      >
                        {room.name}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const RoomDropdown = memo(RoomDropdownComponent);

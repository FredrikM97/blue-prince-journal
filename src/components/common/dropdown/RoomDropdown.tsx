/**
 * RoomDropdown — room picker with live search and grouped sub-menus by category.
 * Rooms are grouped under sub-menus (e.g. Ground Floor, Upper Floor) when not filtering.
 * Typing in the search box flattens results across all groups.
 */

import { memo, useRef } from "react";
import { Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/common/menu/DropdownMenu";
import { MetaText } from "@/components/common/Typography";
import { DropdownTriggerButton } from "@/components/common/dropdown/DropdownTriggerButton";
import type { SelectOption } from "@/components/common/dropdown/selectOption";
import { useRoomDropdownData } from "@/hooks/useRoomDropdownData";

function RoomDropdownComponent({
  value,
  onValueChange,
  placeholder = "Pick a room...",
  clearLabel = "No room",
  triggerWidth = "full",
}: {
  value?: string;
  onValueChange: (next: string) => void;
  placeholder?: string;
  clearLabel?: string;
  triggerWidth?: "full" | "fit";
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  const {
    query,
    setQuery,
    resetQuery,
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
  } = useRoomDropdownData({ value, onValueChange });

  return (
    <DropdownMenu
      modal={false}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) resetQuery();
        if (nextOpen) requestAnimationFrame(() => searchRef.current?.focus());
      }}
    >
      <DropdownMenuTrigger asChild>
        <DropdownTriggerButton
          valueLabel={activeRoom || undefined}
          placeholder={placeholder}
          hasValue={!!activeRoom}
          variant="room"
          triggerWidth={triggerWidth}
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
          const clearOption: SelectOption = { value: "", label: clearLabel };
          let clearTone: "default" | "active" = "default";
          if (!activeRoom) clearTone = "active";
          return (
            <DropdownMenuItem tone={clearTone} onSelect={() => onValueChange(clearOption.value)}>
              {clearOption.label}
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

/**
 * RoomDropdown — room picker with live search and grouped sub-menus by category.
 * Rooms are grouped under sub-menus (e.g. Ground Floor, Upper Floor) when not filtering.
 * Typing in the search box flattens results across all groups.
 */

import { memo, useRef } from "react";
import { ChevronDown, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/common/menu/DropdownMenu";
import { Button } from "@/components/common/Button";
import { MetaText } from "@/components/common/Typography";
import { useRoomDropdownData } from "./useRoomDropdownData";

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
        <Button
          type="button"
          variant="outline"
          className={`h-9 justify-between border-border/60 bg-secondary px-3 py-2 text-sm font-normal hover:border-border hover:bg-secondary ${triggerWidth === "fit" ? "w-auto min-w-40" : "w-full"}`}
          data-has-value={!!activeRoom}
        >
          <span className={activeRoom ? "text-foreground" : "text-muted-foreground"}>
            {activeRoom || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" variant="select">
        <div className="px-1 pb-1">
          <input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => event.stopPropagation()}
            placeholder="Search rooms..."
            className="h-8 w-full rounded border border-border/60 bg-card px-2 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {(() => {
          const clearOption: { value: string; label: string } = { value: "", label: clearLabel };
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
                <Plus className="h-4 w-4 shrink-0" />
                <MetaText as="span" size="sm">
                  Add "{targetRoom}" to {targetGroup}
                </MetaText>
              </DropdownMenuItem>
            )}
            {!showAddOption && searchResults.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No matching rooms</div>
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

                <DropdownMenuSubContent className="max-h-72 min-w-56">
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

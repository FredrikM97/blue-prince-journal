import type { NoteType } from "@/lib/types";
import { FilterButtonGroup } from "@/components/common/filter/FilterButtonGroup";
import { FilterSection } from "@/components/common/filter/FilterSection";
import { GroupedRoomFilterSection } from "@/components/common/filter/GroupedRoomFilterSection";

const TYPE_OPTIONS: { value: NoteType; label: string }[] = [
  { value: "observation", label: "Observations" },
  { value: "clue", label: "Clues" },
  { value: "code", label: "Codes" },
  { value: "theory", label: "Theories" },
  { value: "story", label: "Stories" },
];

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "solved", label: "Solved" },
];

export function NotesFilterPanel({
  filters,
  actions,
}: {
  filters: {
    filterType?: NoteType;
    typeFilter: NoteType | null;
    statusFilter: "open" | "solved" | null;
    roomFilters: string[];
    tagFilter: string | null;
    rooms: string[];
    tags: string[];
  };
  actions: {
    setTypeFilter: (value: NoteType | null) => void;
    setStatusFilter: (value: "open" | "solved" | null) => void;
    setRoomFilters: (value: string[]) => void;
    setTagFilter: (value: string | null) => void;
  };
}) {
  const { filterType, typeFilter, statusFilter, roomFilters, tagFilter, rooms, tags } = filters;
  const { setTypeFilter, setStatusFilter, setRoomFilters, setTagFilter } = actions;

  const typeOptions = TYPE_OPTIONS;
  const statusOptions = STATUS_OPTIONS;
  const tagOptions = tags.map((t) => ({ value: t, label: `#${t}` }));

  return (
    <>
      {!filterType && (
        <FilterSection title="Type" collapsible defaultOpen width="fit" variant="compact">
          <FilterButtonGroup value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
        </FilterSection>
      )}
      <FilterSection title="Status" collapsible defaultOpen width="fit" variant="compact">
        <FilterButtonGroup
          value={statusFilter}
          options={statusOptions}
          onChange={(next) => {
            if (!next) {
              setStatusFilter(null);
              return;
            }
            setStatusFilter(next as "open" | "solved");
          }}
        />
      </FilterSection>
      {rooms.length > 0 && (
        <GroupedRoomFilterSection
          rooms={rooms}
          title="Room"
          defaultOpen={rooms.length <= 4}
          isRoomActive={(room) => roomFilters.includes(room)}
          onToggleRoom={(room) => {
            if (roomFilters.includes(room)) {
              setRoomFilters(roomFilters.filter((selectedRoom) => selectedRoom !== room));
              return;
            }
            setRoomFilters([...roomFilters, room]);
          }}
          onResetAll={() => setRoomFilters([])}
        />
      )}
      {tags.length > 0 && (
        <FilterSection
          title="Tag"
          collapsible
          defaultOpen={tags.length <= 4}
          width="fit"
          variant="compact"
        >
          <FilterButtonGroup value={tagFilter} options={tagOptions} onChange={setTagFilter} />
        </FilterSection>
      )}
    </>
  );
}

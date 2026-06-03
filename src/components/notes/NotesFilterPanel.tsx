import type { NoteType } from "@/lib/types";
import { FilterButtonGroup } from "@/components/common/filter/FilterButtonGroup";
import { FilterSection } from "@/components/common/filter/FilterSection";

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
    roomFilter: string | null;
    tagFilter: string | null;
    rooms: string[];
    tags: string[];
  };
  actions: {
    setTypeFilter: (value: NoteType | null) => void;
    setStatusFilter: (value: "open" | "solved" | null) => void;
    setRoomFilter: (value: string | null) => void;
    setTagFilter: (value: string | null) => void;
  };
}) {
  const { filterType, typeFilter, statusFilter, roomFilter, tagFilter, rooms, tags } = filters;
  const { setTypeFilter, setStatusFilter, setRoomFilter, setTagFilter } = actions;

  const typeOptions = TYPE_OPTIONS;
  const statusOptions = STATUS_OPTIONS;
  const roomOptions = rooms.map((r) => ({ value: r, label: r }));
  const tagOptions = tags.map((t) => ({ value: t, label: `#${t}` }));

  return (
    <>
      {!filterType && (
        <FilterSection title="Type" collapsible defaultOpen width="fit">
          <FilterButtonGroup value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
        </FilterSection>
      )}
      <FilterSection title="Status" collapsible defaultOpen width="fit">
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
        <FilterSection title="Room" collapsible defaultOpen={rooms.length <= 4} width="fit">
          <FilterButtonGroup value={roomFilter} options={roomOptions} onChange={setRoomFilter} />
        </FilterSection>
      )}
      {tags.length > 0 && (
        <FilterSection title="Tag" collapsible defaultOpen={tags.length <= 4} width="fit">
          <FilterButtonGroup value={tagFilter} options={tagOptions} onChange={setTagFilter} />
        </FilterSection>
      )}
    </>
  );
}

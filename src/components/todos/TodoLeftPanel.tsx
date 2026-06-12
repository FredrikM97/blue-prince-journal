import { TODO_SCOPE_OPTIONS } from "./Constants";
import { Stack } from "@/components/common/general/Stack";
import { SidePanelLeft } from "@/components/common/SidePanel";
import { FilterSection } from "@/components/common/filter/FilterSection";
import { FilterButtonGroup } from "@/components/common/filter/FilterButtonGroup";
import { MetaText } from "@/components/common/Typography";

interface TodoLeftPanelProps {
  total: number;
  openCount: number;
  progressCount: number;
  doneCount: number;
  scopeFilter: string | null;
  setScopeFilter: (value: string | null) => void;
}

export function TodoLeftPanel({
  total,
  openCount,
  progressCount,
  doneCount,
  scopeFilter,
  setScopeFilter,
}: TodoLeftPanelProps) {
  let itemLabel = "items";
  if (total === 1) itemLabel = "item";

  const scopeOptions = TODO_SCOPE_OPTIONS.filter(
    (option): option is { value: string; label: string } => option.value !== null,
  );

  return (
    <SidePanelLeft title="Todo" subtitle={`${total} ${itemLabel}`}>
      <Stack gap="0" className="min-h-0 flex-1 overflow-y-auto">
        <Stack gap="4">
          <Stack gap="1">
            <MetaText>Open: {openCount}</MetaText>
            <MetaText>In progress: {progressCount}</MetaText>
            <MetaText>Done: {doneCount}</MetaText>
          </Stack>

          <FilterSection title="Scope">
            <FilterButtonGroup
              value={scopeFilter}
              options={scopeOptions}
              onChange={setScopeFilter}
              allLabel="All"
            />
          </FilterSection>
        </Stack>
      </Stack>
    </SidePanelLeft>
  );
}

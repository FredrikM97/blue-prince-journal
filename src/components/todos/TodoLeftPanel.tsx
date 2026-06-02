import { TODO_SCOPE_OPTIONS } from "./Constants";
import { SidePanel } from "@/components/common/SidePanel";
import { FilterSection } from "@/components/common/filter/FilterSection";
import { FilterButtonGroup } from "@/components/common/filter/FilterButtonGroup";

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
    <SidePanel.Left title="Todo" subtitle={`${total} ${itemLabel}`}>
      <div className="todos-left-stack">
        <div className="todos-left-stats">
          <p>Open: {openCount}</p>
          <p>In progress: {progressCount}</p>
          <p>Done: {doneCount}</p>
        </div>

        <FilterSection title="Scope">
          <FilterButtonGroup
            value={scopeFilter}
            options={scopeOptions}
            onChange={setScopeFilter}
            allLabel="All"
          />
        </FilterSection>
      </div>
    </SidePanel.Left>
  );
}

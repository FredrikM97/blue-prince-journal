import { TODO_SCOPE_OPTIONS } from "./Constants";
import { SelectButton } from "@/components/common/Button";
import { SidePanel } from "@/components/common/SidePanel";

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

  return (
    <div className="todos-left-stack">
      <SidePanel.Left title="Todo" subtitle={`${total} ${itemLabel}`}>
        <div className="todos-left-stats">
          <p>Open: {openCount}</p>
          <p>In progress: {progressCount}</p>
          <p>Done: {doneCount}</p>
        </div>
      </SidePanel.Left>
      <SidePanel.Left title="Scope">
        <div className="flex flex-wrap gap-1">
          {TODO_SCOPE_OPTIONS.map((option) => (
            <SelectButton
              key={String(option.value)}
              active={scopeFilter === option.value}
              onClick={() => setScopeFilter(option.value)}
            >
              {option.label}
            </SelectButton>
          ))}
        </div>
      </SidePanel.Left>
    </div>
  );
}

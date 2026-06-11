import { TODO_STATUS_COLUMNS } from "./Constants";
import { TodoItem } from "./TodoItem";
import type { Todo, TodoStatus } from "@/lib/types";
import { Grid } from "@/components/common/LayoutPrimitives";
import { Stack } from "@/components/common/general/Stack";
import { Heading, MetaText } from "@/components/common/Typography";
import { Tabs, TabsList, TabsTrigger } from "@/components/notes/Tabs";
import { useIsPageLayoutMobile } from "@/hooks/usePageLayoutMobile";
import { useProgressiveVisibleCount } from "@/hooks/useProgressiveVisibleCount";

function TodoColumn({
  label,
  value,
  loading = false,
  todos,
  onToggle,
  onDelete,
  onOpenPreview,
}: {
  label: string;
  value: string;
  loading?: boolean;
  todos: Todo[];
  onToggle: (id: string, next: TodoStatus) => void;
  onDelete: (id: string) => void;
  onOpenPreview: (t: Todo) => void;
}) {
  const visibleCount = useProgressiveVisibleCount({
    total: todos.length,
    enabled: !loading && todos.length > 100,
    initial: 40,
    step: 40,
  });
  const visibleTodos = todos.slice(0, visibleCount);

  return (
    <Stack as="section" className="rounded-lg border border-border bg-card" gap="0">
      <Stack as="header" className="flex items-center justify-between border-b border-border px-3 py-2" gap="0">
        <Heading as="h2" size="base" variant="section-label">
          {label}
        </Heading>
        <MetaText as="span">{loading ? 0 : todos.length}</MetaText>
      </Stack>
      <Stack as="ul" className="divide-y divide-border" gap="0">
        {!loading && todos.length === 0 && (
          <Stack as="li" className="px-3 py-6 text-center text-xs text-muted-foreground" gap="0">
            {value === "open" ? "Press N to add a todo" : "Empty"}
          </Stack>
        )}
        {visibleTodos.map((t) => (
          <TodoItem
            key={t.id}
            todo={t}
            onToggle={onToggle}
            onDelete={onDelete}
            onOpenPreview={onOpenPreview}
          />
        ))}
        {!loading && visibleCount < todos.length && (
          <Stack as="li" className="px-3 py-3" gap="2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-muted/60" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-muted/50" />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
}

export function TodoMiddlePanel({
  grouped,
  loading = false,
  onToggle,
  onDelete,
  onOpenPreview,
  activeMobileStatus = "open",
  onActiveMobileStatusChange,
}: {
  grouped: Record<TodoStatus, Todo[]>;
  loading?: boolean;
  onToggle: (id: string, next: TodoStatus) => void;
  onDelete: (id: string) => void;
  onOpenPreview: (todo: Todo) => void;
  activeMobileStatus?: TodoStatus;
  onActiveMobileStatusChange?: (status: TodoStatus) => void;
}) {
  const isPageLayoutMobile = useIsPageLayoutMobile();
  const activeColumn =
    TODO_STATUS_COLUMNS.find((col) => col.value === activeMobileStatus) ?? TODO_STATUS_COLUMNS[0];

  return (
    <Stack as="section" gap="0">
      <Tabs
        className={isPageLayoutMobile ? "mb-3" : "hidden"}
        value={activeColumn.value}
        onValueChange={(value) => onActiveMobileStatusChange?.(value as TodoStatus)}
      >
        <TabsList className="grid h-9 w-full grid-cols-3 rounded-md border border-input bg-muted/30 p-0.5">
          {TODO_STATUS_COLUMNS.map((col) => (
            <TabsTrigger key={col.value} className="h-7 w-full rounded-sm text-xs" value={col.value}>
              <span className="mr-1">{col.label}</span>
              <span className="text-[11px] text-muted-foreground">
                {loading ? 0 : grouped[col.value].length}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Stack className={isPageLayoutMobile ? undefined : "hidden"} gap="0">
        <TodoColumn
          key={activeColumn.value}
          label={activeColumn.label}
          value={activeColumn.value}
          loading={loading}
          todos={grouped[activeColumn.value]}
          onToggle={onToggle}
          onDelete={onDelete}
          onOpenPreview={onOpenPreview}
        />
      </Stack>

      <Grid as="div" className={isPageLayoutMobile ? "hidden" : "grid"} variant="cols-3-md" gap="4">
        {TODO_STATUS_COLUMNS.map((col) => (
          <TodoColumn
            key={col.value}
            label={col.label}
            value={col.value}
            loading={loading}
            todos={grouped[col.value]}
            onToggle={onToggle}
            onDelete={onDelete}
            onOpenPreview={onOpenPreview}
          />
        ))}
      </Grid>
    </Stack>
  );
}

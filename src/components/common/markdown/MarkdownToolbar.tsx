import { useEffect, useRef, useState, type ReactNode } from "react";
import { Eye, EyeOff, Maximize2, MoreHorizontal, WandSparkles } from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/common/dropdown/DropdownMenu";
import { MarkdownShortcutHelp } from "@/components/common/markdown/MarkdownShortcutHelp";
import { Stack } from "@/components/common/Stack";

export type MarkdownToolbarAction = {
  key: string;
  label: string;
  icon: ReactNode;
  onSelect: () => void;
};

export function MarkdownToolbar({
  primaryActions,
  overflowActions,
  onFormatTables,
  preview,
  onTogglePreview,
  allowExpand,
  onExpand,
}: {
  primaryActions: MarkdownToolbarAction[];
  overflowActions: MarkdownToolbarAction[];
  onFormatTables: () => void;
  preview: boolean;
  onTogglePreview: () => void;
  allowExpand: boolean;
  onExpand: () => void;
}) {
  const toolbarContainerRef = useRef<HTMLDivElement | null>(null);
  const [showOverflowMenu, setShowOverflowMenu] = useState(false);

  useEffect(() => {
    const container = toolbarContainerRef.current;
    if (!container) return;

    const COMPACT_BREAKPOINT = 520;

    const refreshLayout = () => {
      const compact = container.clientWidth < COMPACT_BREAKPOINT;
      setShowOverflowMenu(compact && overflowActions.length > 0);
    };

    refreshLayout();

    const observer = new ResizeObserver(() => {
      refreshLayout();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [overflowActions.length]);

  let previewToggleLabel = "Show preview";
  let expandLabel = "Expand editor";
  if (preview) {
    previewToggleLabel = "Hide preview";
    expandLabel = "Expand preview";
  }

  const showInlineOverflow = overflowActions.length > 0 && !showOverflowMenu;

  return (
    <div ref={toolbarContainerRef}>
      <Stack as="div" gap="0" variant="md-toolbar" role="toolbar" ariaLabel="Formatting tools">
        {primaryActions.map((action) => (
          <Button
            variant="ghost"
            size="icon-h2"
            key={action.key}
            aria-label={action.label}
            title={action.label}
            onClick={action.onSelect}
          >
            {action.icon}
          </Button>
        ))}

        {showInlineOverflow &&
          overflowActions.map((action) => (
            <Button
              variant="ghost"
              size="icon-h2"
              key={action.key}
              aria-label={action.label}
              title={action.label}
              onClick={action.onSelect}
            >
              {action.icon}
            </Button>
          ))}

        {!showOverflowMenu && (
          <Button
            variant="ghost"
            size="icon-h2"
            aria-label="Format tables"
            title="Format tables"
            onClick={onFormatTables}
          >
            <WandSparkles className="h-3.5 w-3.5" />
          </Button>
        )}

        {showOverflowMenu && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-h2"
                aria-label="More formatting tools"
                title="More formatting tools"
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={6}>
              {overflowActions.map((action) => (
                <DropdownMenuItem
                  key={action.key}
                  onSelect={(event) => {
                    event.preventDefault();
                    action.onSelect();
                  }}
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  onFormatTables();
                }}
              >
                <WandSparkles className="h-3.5 w-3.5" />
                Format tables
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Stack as="span" gap="0" variant="md-toolbar-divider" />
        <MarkdownShortcutHelp />
        <Stack as="span" gap="0" variant="md-toolbar-divider" />

        <Button
          variant="ghost"
          size="icon-h2"
          aria-label={previewToggleLabel}
          title={previewToggleLabel}
          onClick={onTogglePreview}
        >
          {preview && <EyeOff className="icon-sm" />}
          {!preview && <Eye className="icon-sm" />}
        </Button>

        {allowExpand && (
          <>
            <Stack as="span" gap="0" variant="md-toolbar-divider" />
            <Button
              variant="ghost"
              size="icon-h2"
              aria-label={expandLabel}
              title={expandLabel}
              onClick={onExpand}
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </Stack>
    </div>
  );
}

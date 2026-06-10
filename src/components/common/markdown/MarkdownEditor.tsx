import { useRef, useState, type RefObject } from "react";
import { Bold, Italic, List, ListOrdered, Table } from "lucide-react";
import { MarkdownPreview } from "@/components/common/markdown/MarkdownPreview";
import {
  MarkdownToolbar,
  type MarkdownToolbarAction,
} from "@/components/common/markdown/MarkdownToolbar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/common/Dialog";

import { Stack } from "@/components/common/general/Stack";

interface TableBlock {
  start: number;
  end: number;
  text: string;
}

function formatAllMarkdownTables(markdown: string) {
  const trailingNewline = markdown.endsWith("\n");
  const lines = markdown.split("\n");
  const out: string[] = [];

  let i = 0;
  while (i < lines.length) {
    if (!isTableLikeLine(lines[i])) {
      out.push(lines[i]);
      i += 1;
      continue;
    }

    let j = i;
    while (j < lines.length && isTableLikeLine(lines[j])) j += 1;
    const blockLines = lines.slice(i, j);

    if (blockLines.length < 2) {
      out.push(...blockLines);
      i = j;
      continue;
    }

    const formatted = formatTableMarkdown(blockLines.join("\n"));
    out.push(...(formatted ? formatted.split("\n") : blockLines));
    i = j;
  }

  const result = out.join("\n");
  return trailingNewline && !result.endsWith("\n") ? `${result}\n` : result;
}

function formatTableMarkdown(source: string) {
  const trimmed = source.trim();
  if (!trimmed) return null;

  const parsedRows = trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ raw: line, cells: parseTableRow(line) }));

  const rows = parsedRows
    .filter(({ raw, cells }) => !isSeparatorLine(raw) && !isSeparatorRow(cells))
    .map(({ cells }) => cells);

  if (rows.length === 0) return null;

  const maxCols = Math.max(...rows.map((row) => row.length));
  if (maxCols < 2) return null;

  const normalized = rows.map((row) => {
    const filled = [...row];
    while (filled.length < maxCols) filled.push("");
    return filled;
  });

  const header = normalized[0].map((cell, idx) => cell || `Column ${idx + 1}`);
  const body = normalized.slice(1);

  const colWidths = header.map((cell, colIdx) => {
    const bodyWidth = Math.max(0, ...body.map((row) => row[colIdx].length));
    return Math.max(cell.length, bodyWidth, 3);
  });

  const formatRow = (row: string[]) =>
    `| ${row.map((cell, idx) => cell.padEnd(colWidths[idx], " ")).join(" | ")} |`;
  const separator = `| ${colWidths.map((width) => "-".repeat(width)).join(" | ")} |`;

  const lines = [formatRow(header), separator, ...body.map((row) => formatRow(row))];
  return lines.join("\n");
}

function findTableBlockAtCursor(value: string, cursorPos: number): TableBlock | null {
  const lines = value.split("\n");
  let currentLine = 0;
  let offset = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const lineLength = lines[i].length;
    if (cursorPos <= offset + lineLength) {
      currentLine = i;
      break;
    }
    offset += lineLength + 1;
    currentLine = i;
  }

  if (!isTableLikeLine(lines[currentLine])) return null;

  let startLine = currentLine;
  let endLine = currentLine;
  while (startLine > 0 && isTableLikeLine(lines[startLine - 1])) startLine -= 1;
  while (endLine < lines.length - 1 && isTableLikeLine(lines[endLine + 1])) endLine += 1;

  if (endLine - startLine < 1) return null;

  const start = lines.slice(0, startLine).reduce((acc, line) => acc + line.length + 1, 0);
  const text = lines.slice(startLine, endLine + 1).join("\n");
  const end = start + text.length;

  return { start, end, text };
}

function parseTableRow(line: string) {
  const bare = line.replace(/^\||\|$/g, "").trim();
  if (bare.includes("|")) {
    return bare.split("|").map((cell) => cell.trim());
  }
  if (bare.includes("\t")) {
    return bare.split("\t").map((cell) => cell.trim());
  }
  if (bare.includes(",")) {
    return bare.split(",").map((cell) => cell.trim());
  }
  return [bare];
}

function isSeparatorCell(cell: string) {
  return /^:?-{3,}:?$/.test(cell.trim());
}

function isSeparatorLine(line: string) {
  const raw = line.trim();
  if (!raw.includes("|")) return false;
  const bare = raw.replace(/^\||\|$/g, "").trim();
  return /^:?-{3,}:?(\s*\|\s*:?-{3,}:?)+/.test(bare);
}

function isSeparatorRow(row: string[]) {
  if (row.length <= 1) return false;
  if (row.every((cell) => isSeparatorCell(cell))) return true;
  return row.length >= 2 && isSeparatorCell(row[0]) && isSeparatorCell(row[1]);
}

function isTableLikeLine(line: string) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  return trimmed.includes("|");
}
// ── toolbar actions ───────────────────────────────────────────────
type WrapMode = "inline" | "block-line";
interface ToolbarAction {
  icon: React.ReactNode;
  label: string;
  prefix: string;
  suffix?: string;
  mode?: WrapMode;
}

const ACTIONS: ToolbarAction[] = [
  { icon: <Bold className="h-3.5 w-3.5" />, label: "Bold", prefix: "**", suffix: "**" },
  { icon: <Italic className="h-3.5 w-3.5" />, label: "Italic", prefix: "_", suffix: "_" },
  {
    icon: <List className="h-3.5 w-3.5" />,
    label: "Bullet list",
    prefix: "- ",
    mode: "block-line",
  },
  {
    icon: <ListOrdered className="h-3.5 w-3.5" />,
    label: "Numbered list",
    prefix: "1. ",
    mode: "block-line",
  },
  {
    icon: <Table className="h-3.5 w-3.5" />,
    label: "Table",
    prefix: "\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell     | Cell     |\n",
    mode: "block-line",
  },
];

function applyAction(
  textarea: HTMLTextAreaElement,
  action: ToolbarAction,
  setValue: (v: string) => void,
) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);
  let next: string;
  let newStart: number;
  let newEnd: number;

  if (action.mode === "block-line") {
    if (action.label === "Table") {
      const didFormat = tryFormatTableInEditor(textarea, setValue);
      if (didFormat) {
        return;
      }

      if (!selected.trim()) {
        const template =
          "\n| Column 1 | Column 2 |\n| -------- | -------- |\n| Cell     | Cell     |\n";
        next = value.slice(0, start) + template + value.slice(end);
        newStart = start + template.length;
        newEnd = newStart;
        setValue(next);
        requestAnimationFrame(() => {
          textarea.focus();
          textarea.setSelectionRange(newStart, newEnd);
        });
        return;
      }
    }

    // prepend prefix to the start of each selected line (or current line)
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = end === start ? value.indexOf("\n", start) + 1 || value.length : end;
    const lines = value.slice(lineStart, lineEnd);
    const prefixed = lines
      .split("\n")
      .map((l) => (l.length ? `${action.prefix}${l}` : l))
      .join("\n");
    next = value.slice(0, lineStart) + prefixed + value.slice(lineEnd);
    newStart = lineStart;
    newEnd = lineStart + prefixed.length;
  } else {
    const suffix = action.suffix ?? action.prefix;
    const inserted = `${action.prefix}${selected || "text"}${suffix}`;
    next = value.slice(0, start) + inserted + value.slice(end);
    newStart = start + action.prefix.length;
    newEnd = newStart + (selected || "text").length;
  }

  setValue(next);
  // Restore cursor after React re-renders
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newStart, newEnd);
  });
}

function tryFormatTableInEditor(
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void,
): boolean {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const selected = value.slice(start, end);

  if (selected.trim()) {
    const formatted = formatTableMarkdown(selected);
    if (!formatted) return false;

    const next = value.slice(0, start) + formatted + value.slice(end);
    const nextStart = start;
    const nextEnd = start + formatted.length;
    setValue(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextStart, nextEnd);
    });
    return true;
  }

  const block = findTableBlockAtCursor(value, start);
  if (!block) return false;

  const formatted = formatTableMarkdown(block.text);
  if (!formatted) return false;

  const next = value.slice(0, block.start) + formatted + value.slice(block.end);
  const nextStart = block.start;
  const nextEnd = block.start + formatted.length;
  setValue(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(nextStart, nextEnd);
  });
  return true;
}

function findTableCellJump(value: string, cursor: number, reverse: boolean) {
  const lineStart = value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  let lineEnd = value.indexOf("\n", cursor);
  if (lineEnd === -1) lineEnd = value.length;

  const line = value.slice(lineStart, lineEnd);
  if (!line.includes("|")) return null;

  const localCursor = cursor - lineStart;
  const pipes: number[] = [];
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] === "|") pipes.push(i);
  }
  if (pipes.length < 2) return null;

  if (reverse) {
    for (let i = pipes.length - 1; i >= 0; i -= 1) {
      if (pipes[i] < localCursor - 1) {
        return lineStart + Math.min(line.length, pipes[i] + 2);
      }
    }
    return null;
  }

  for (let i = 0; i < pipes.length; i += 1) {
    if (pipes[i] > localCursor) {
      return lineStart + Math.min(line.length, pipes[i] + 2);
    }
  }

  return null;
}

/**
 * Handles Enter inside a list item.
 * - Empty item (just the prefix): removes the prefix and ends the list.
 * - Non-empty item: inserts a new item on the next line with the same prefix
 *   (or the next sequential number for ordered lists).
 * Returns true when the event was fully handled.
 */
function continueListOnEnter(
  textarea: HTMLTextAreaElement,
  setValue: (v: string) => void,
): boolean {
  const { selectionStart: start, selectionEnd: end, value } = textarea;

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEndIdx = value.indexOf("\n", start);
  const lineText = value.slice(lineStart, lineEndIdx === -1 ? value.length : lineEndIdx);

  // bullet: optional indent + (- | * | +) + one-or-more spaces
  const bulletMatch = /^(\s*)([-*+])( +)/.exec(lineText);
  // numbered: optional indent + digits + ". "
  const numberedMatch = /^(\s*)(\d+)(\. )/.exec(lineText);

  const m = bulletMatch ?? numberedMatch;
  if (!m) return false;

  const prefixLen = m[0].length;
  const contentAfterPrefix = lineText.slice(prefixLen);

  if (!contentAfterPrefix.trim()) {
    // Empty item — terminate the list by stripping the prefix
    const nextVal = value.slice(0, lineStart) + value.slice(lineStart + prefixLen);
    setValue(nextVal);
    const newPos = lineStart;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newPos, newPos);
    });
    return true;
  }

  // Build the prefix for the next line
  let nextPrefix: string;
  if (numberedMatch) {
    const [, indent, num, sep] = numberedMatch;
    nextPrefix = `${indent}${parseInt(num, 10) + 1}${sep}`;
  } else {
    nextPrefix = m[0]; // same bullet marker + spacing
  }

  const insert = `\n${nextPrefix}`;
  const nextVal = value.slice(0, start) + insert + value.slice(end);
  const newPos = start + insert.length;
  setValue(nextVal);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newPos, newPos);
  });
  return true;
}

function insertTabAtCursor(textarea: HTMLTextAreaElement, setValue: (v: string) => void) {
  const { selectionStart: start, selectionEnd: end, value } = textarea;
  const next = `${value.slice(0, start)}\t${value.slice(end)}`;
  const caret = start + 1;
  setValue(next);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(caret, caret);
  });
}

// ── component ────────────────────────────────────────────────────
export function MarkdownEditor({
  value,
  onChange,
  onBlur,
  onCursorChange,
  onTextKeyDown,
  placeholder,
  rows = 6,
  textareaRef,
  allowExpand = true,
  defaultPreview = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  onCursorChange?: (cursor: number) => void;
  onTextKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => boolean | void;
  placeholder?: string;
  rows?: number;
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  allowExpand?: boolean;
  defaultPreview?: boolean;
}) {
  const [preview, setPreview] = useState(defaultPreview);
  const [expanded, setExpanded] = useState(false);
  const localRef = useRef<HTMLTextAreaElement>(null);
  const ref = textareaRef ?? localRef;
  const primaryActions = ACTIONS.slice(0, 4);
  const overflowActions = ACTIONS.slice(4);
  let dialogTitle = "Edit details";
  if (preview) {
    dialogTitle = "Preview";
  }

  const primaryToolbarActions: MarkdownToolbarAction[] = primaryActions.map((action) => ({
    key: action.label,
    label: action.label,
    icon: action.icon,
    onSelect: () => {
      if (!ref.current) return;
      applyAction(ref.current, action, onChange);
    },
  }));

  const overflowToolbarActions: MarkdownToolbarAction[] = overflowActions.map((action) => ({
    key: action.label,
    label: action.label,
    icon: action.icon,
    onSelect: () => {
      if (!ref.current) return;
      applyAction(ref.current, action, onChange);
    },
  }));

  function handleFormatTables() {
    if (!ref.current) return;
    const formatted = tryFormatTableInEditor(ref.current, onChange);
    if (!formatted) onChange(formatAllMarkdownTables(value));
  }

  return (
    <Stack as="div" gap="0" className="flex min-h-0 flex-1 flex-col">
      <MarkdownToolbar
        primaryActions={primaryToolbarActions}
        overflowActions={overflowToolbarActions}
        onFormatTables={handleFormatTables}
        preview={preview}
        onTogglePreview={() => setPreview((v) => !v)}
        allowExpand={allowExpand}
        onExpand={() => setExpanded(true)}
      />

      {preview && (
        <Stack as="div" gap="0" className="min-h-[6rem] rounded-b-md border border-input bg-background p-3">
          <MarkdownPreview>{value}</MarkdownPreview>
        </Stack>
      )}
      {!preview && (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onCursorChange?.(e.target.selectionStart ?? e.target.value.length);
          }}
          onBlur={onBlur}
          onClick={(e) => onCursorChange?.(e.currentTarget.selectionStart ?? value.length)}
          onKeyUp={(e) => onCursorChange?.(e.currentTarget.selectionStart ?? value.length)}
          onKeyDown={(e) => {
            const handled = onTextKeyDown?.(e);
            if (handled || e.defaultPrevented) {
              return;
            }

            if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey && ref.current) {
              if (continueListOnEnter(ref.current, onChange)) {
                e.preventDefault();
                return;
              }
            }

            if (e.key === "Tab" && !e.metaKey && !e.ctrlKey && !e.altKey && ref.current) {
              e.preventDefault();
              const next = findTableCellJump(value, ref.current.selectionStart, e.shiftKey);
              if (next !== null) {
                ref.current.setSelectionRange(next, next);
                return;
              }

              insertTabAtCursor(ref.current, onChange);
              return;
            }

            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f") {
              if (!ref.current) return;
              const didFormat = tryFormatTableInEditor(ref.current, onChange);
              if (!didFormat) onChange(formatAllMarkdownTables(value));
              e.preventDefault();
            }
          }}
          placeholder={placeholder}
          rows={rows}
          className="flex min-h-0 w-full flex-1 rounded-b-md rounded-t-none border border-input border-t-0 bg-card px-3 py-2 font-mono text-[13px] leading-6 shadow-sm placeholder:text-muted-foreground [font-variant-numeric:tabular-nums] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        />
      )}
      {allowExpand && (
        <Dialog open={expanded} onOpenChange={setExpanded}>
          <DialogContent variant="wide">
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
            </DialogHeader>
            <Stack as="div" gap="0" variant="dialog-scroll-body">
              <MarkdownEditor
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={28}
                allowExpand={false}
                defaultPreview={preview}
              />
            </Stack>
          </DialogContent>
        </Dialog>
      )}
    </Stack>
  );
}

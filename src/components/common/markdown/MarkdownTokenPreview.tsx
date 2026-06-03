import type ReactMarkdown from "react-markdown";

// Colors match graph edge colors: amber=room, blue=tag, green=note, teal=date, violet=type
const TOKEN_CLASS: Record<string, string> = {
  "@": "#d97706",
  "#": "#2563eb",
  "^": "#059669",
  ">": "#0d9488",
  "!": "#7c3aed",
};

// (?<!\w) prevents matching tokens embedded in words (e.g. x^2 or user@host)
const TOKEN_PATTERN = /(?<!\w)([#@^][\w-]+|!\w+|>\d{4}-\d{2}-\d{2})/g;

function highlightTokensInText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const i = match.index!;
    if (i > last) parts.push(text.slice(last, i));
    const tokenColor = TOKEN_CLASS[match[0][0]];
    if (tokenColor) {
      parts.push(
        <code
          key={key++}
          style={{
            color: tokenColor,
            background: "transparent",
            fontFamily: "var(--font-mono)",
            fontSize: "0.83em",
            fontWeight: 600,
          }}
        >
          {match[0]}
        </code>,
      );
    } else {
      parts.push(match[0]);
    }
    last = i + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  if (parts.length === 0) return text;
  if (parts.length === 1) return parts[0];
  return <>{parts}</>;
}

function processChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === "string") return highlightTokensInText(children);
  if (Array.isArray(children)) {
    return children.map((child) =>
      typeof child === "string" ? highlightTokensInText(child) : child,
    );
  }
  return children;
}

/** ReactMarkdown `components` map that colorizes token syntax in rendered preview. */
export const TOKEN_PREVIEW_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  p: ({ children }) => <p>{processChildren(children)}</p>,
  li: ({ children, ...props }) => <li {...props}>{processChildren(children)}</li>,
};

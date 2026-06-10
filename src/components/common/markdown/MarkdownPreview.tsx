import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Theme-backed token classes: room, tag, note, date, type
const TOKEN_CLASS: Record<string, string> = {
  "@": "bg-transparent font-mono text-[0.83em] font-semibold text-brass",
  "#": "bg-transparent font-mono text-[0.83em] font-semibold text-chart-2",
  "^": "bg-transparent font-mono text-[0.83em] font-semibold text-chart-4",
  ">": "bg-transparent font-mono text-[0.83em] font-semibold text-chart-5",
  "!": "bg-transparent font-mono text-[0.83em] font-semibold text-chart-3",
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
    const tokenClassName = TOKEN_CLASS[match[0][0]];
    if (tokenClassName) {
      parts.push(
        <code key={key++} className={tokenClassName}>
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

const TOKEN_PREVIEW_COMPONENTS: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  p: ({ children }) => <p>{processChildren(children)}</p>,
  ul: ({ node: _node, className, ...props }) => (
    <ul className={`my-2 list-disc pl-5 ${className ?? ""}`.trim()} {...props} />
  ),
  ol: ({ node: _node, className, ...props }) => (
    <ol className={`my-2 list-decimal pl-5 ${className ?? ""}`.trim()} {...props} />
  ),
  li: ({ children, node: _node, className, ...props }) => (
    <li className={`my-1 ${className ?? ""}`.trim()} {...props}>
      {processChildren(children)}
    </li>
  ),
  table: ({ node: _node, className, ...props }) => (
    <table
      className={`my-3 w-full border-collapse overflow-hidden rounded-md border border-border ${className ?? ""}`.trim()}
      {...props}
    />
  ),
  thead: ({ node: _node, className, ...props }) => (
    <thead className={`bg-muted ${className ?? ""}`.trim()} {...props} />
  ),
  th: ({ node: _node, className, ...props }) => (
    <th
      className={`border border-border px-2.5 py-1.5 text-left align-top ${className ?? ""}`.trim()}
      {...props}
    />
  ),
  td: ({ node: _node, className, ...props }) => (
    <td
      className={`border border-border px-2.5 py-1.5 text-left align-top ${className ?? ""}`.trim()}
      {...props}
    />
  ),
  tbody: ({ node: _node, className, ...props }) => (
    <tbody className={`[&_tr:nth-child(2n)]:bg-secondary ${className ?? ""}`.trim()} {...props} />
  ),
};

/** Renders markdown body content with GFM and token color highlighting. */
export function MarkdownPreview({ children }: { children: string }) {
  if (!children.trim()) return null;
  return (
    <div className="prose prose-sm max-w-none text-sm leading-relaxed [&>*+*]:mt-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={TOKEN_PREVIEW_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

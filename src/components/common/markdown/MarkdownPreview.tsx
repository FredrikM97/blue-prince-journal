import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { TOKEN_PREVIEW_COMPONENTS } from "@/components/common/markdown/MarkdownTokenPreview";
import { Stack } from "@/components/common/Stack";

/** Renders markdown body content with GFM and token color highlighting. */
export function MarkdownPreview({ children }: { children: string }) {
  if (!children.trim()) return null;
  return (
    <Stack variant="markdown-preview-surface" gap="0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={TOKEN_PREVIEW_COMPONENTS}>
        {children}
      </ReactMarkdown>
    </Stack>
  );
}

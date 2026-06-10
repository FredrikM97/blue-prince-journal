/**
 * Shared primitives for note and todo preview panels/dialogs.
 * Import from here to keep both in sync.
 */
import { MetaText, Text } from "@/components/common/Typography";
import { Inline, SectionBlock } from "@/components/common/LayoutPrimitives";

export function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Inline align="start" gap="2">
      <MetaText as="span" className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </MetaText>
      <Text as="div" size="sm" className="min-w-0 flex-1" minWidthZero>
        {children}
      </Text>
    </Inline>
  );
}

export function PreviewSection({ children }: { children: React.ReactNode }) {
  return <SectionBlock>{children}</SectionBlock>;
}

export function PreviewTimestamps({
  updatedAt,
  completedAt,
  createdAt,
}: {
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}) {
  const hasExtra = updatedAt !== createdAt || completedAt;
  if (!hasExtra) return null;
  return (
    <PreviewSection>
      <div>
        {updatedAt !== createdAt && (
          <MetaText>Updated {new Date(updatedAt).toLocaleDateString()}</MetaText>
        )}
        {completedAt && <MetaText>Completed {new Date(completedAt).toLocaleDateString()}</MetaText>}
      </div>
    </PreviewSection>
  );
}

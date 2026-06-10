import type { ReactNode } from "react";
import { Heading } from "@/components/common/Typography";
import { Stack } from "@/components/common/general/Stack";

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack as="section" gap="5">
      <Heading as="h2" size="xl" variant="section-title-h1">
        <Stack as="span" className="h-5 w-px bg-border" gap="0" />
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

export function SettingsSubsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack className="space-y-3 border-t border-border pt-4" gap="0">
      <Heading as="h3" size="base" variant="section-label">
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

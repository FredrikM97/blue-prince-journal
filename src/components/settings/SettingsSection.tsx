import type { ReactNode } from "react";
import { Heading } from "@/components/common/Typography";
import { Stack } from "@/components/common/Stack";

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack as="section" gap="5">
      <Heading as="h2" size="xl" variant="section-title-h1">
        <Stack as="span" className="section-rule" gap="0" />
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

export function SettingsSubsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Stack className="settings-subsection" gap="0">
      <Heading as="h3" size="base" variant="section-label">
        {title}
      </Heading>
      {children}
    </Stack>
  );
}

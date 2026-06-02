import type { ReactNode } from "react";
import { Heading } from "@/components/common/Typography";

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-section">
      <Heading as="h2" size="xl" variant="settings-section-title">
        <span aria-hidden className="settings-section-rule" />
        {title}
      </Heading>
      {children}
    </section>
  );
}

export function SettingsSubsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="settings-subsection">
      <Heading as="h3" size="base" variant="section-label">
        {title}
      </Heading>
      {children}
    </div>
  );
}

import type { ReactNode } from "react";

export function SettingsSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="settings-section">
      <h2 className="settings-section-title">
        <span aria-hidden className="settings-section-rule" />
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SettingsSubsection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="settings-subsection">
      <h3 className="section-label">{title}</h3>
      {children}
    </div>
  );
}

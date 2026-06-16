export type MobilePanelLabels = {
  left?: string;
  right?: string;
};

const DEFAULT_MOBILE_PANEL_LABELS: MobilePanelLabels = {
  left: "Left panel",
  right: "Right panel",
};

const MOBILE_PANEL_LABELS_BY_PATH: Record<string, MobilePanelLabels> = {
  "/": { left: "Filters", right: "Preview" },
  "/notes": { left: "Filters", right: "Preview" },
  "/graph": { left: "Filters", right: "Details" },
  "/map": { left: "Filters", right: "Details" },
  "/images": { left: "Library", right: "Details" },
  "/dartboard": { left: "Board", right: "Controls" },
  "/todos": { left: "Filters" },
};

export function resolveMobilePanelLabels(pathname: string): MobilePanelLabels {
  return MOBILE_PANEL_LABELS_BY_PATH[pathname] ?? DEFAULT_MOBILE_PANEL_LABELS;
}
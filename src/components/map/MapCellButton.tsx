import type { ReactNode } from "react";

type MapCellStatus = "neutral" | "cleared";

export function MapCellButton({
  status,
  selected,
  onClick,
  children,
}: {
  status: MapCellStatus;
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  let selectedState = "false";
  if (selected) {
    selectedState = "true";
  }

  return (
    <button
      type="button"
      className="map-cell inline-flex cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={onClick}
      data-map-status={status}
      data-map-selected={selectedState}
    >
      {children}
    </button>
  );
}

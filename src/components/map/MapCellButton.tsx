import type { ReactNode } from "react";
import { Button } from "@/components/common/Button";

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
    <Button
      type="button"
      variant="map-cell"
      size="content"
      direction="column"
      onClick={onClick}
      data-map-status={status}
      data-map-selected={selectedState}
    >
      {children}
    </Button>
  );
}

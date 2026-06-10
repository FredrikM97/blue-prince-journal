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

  let statusClassName = "bg-card border-border text-muted-foreground";
  if (status === "cleared") {
    statusClassName = "border-brass bg-brass text-brass-foreground";
  }

  let selectedClassName = "";
  if (selected) {
    selectedClassName = "border-ring ring-2 ring-ring ring-inset";
  }

  return (
    <button
      type="button"
      className={`relative z-0 inline-flex aspect-square h-auto w-full cursor-pointer flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border px-1 py-1.5 text-center text-xs font-normal leading-tight whitespace-normal transition transition-colors hover:z-10 hover:scale-[1.03] hover:overflow-visible hover:border-brass focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 max-[40rem]:px-1 max-[40rem]:py-1 ${statusClassName} ${selectedClassName}`.trim()}
      onClick={onClick}
      data-map-status={status}
      data-map-selected={selectedState}
    >
      {children}
    </button>
  );
}

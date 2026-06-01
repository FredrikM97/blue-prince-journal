import { SidePanel } from "@/components/common/SidePanel";

export function MapLeftPanel({ onClose }: { onClose?: () => void }) {
  return (
    <SidePanel.Left
      title="House Map"
      subtitle="5 × 9 grid — click a cell to place a room and add comments."
      onClose={onClose}
    />
  );
}

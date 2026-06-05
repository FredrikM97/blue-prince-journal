import { StoredImageView } from "@/components/common/StoredImageView";
import { Text } from "@/components/common/Typography";

export function ImageThumbButton({
  imageId,
  imageName,
  label,
  selected,
  onClick,
}: {
  imageId: string;
  imageName: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  let thumbClass = "group images-thumb";
  if (selected) thumbClass = "group images-thumb images-thumb-selected";

  return (
    <button type="button" onClick={onClick} className={thumbClass}>
      <StoredImageView id={imageId} alt={imageName} className="images-thumb-image" mode="thumb" />
      <div className="images-thumb-overlay">
        <Text as="div" size="xs" tone="default" variant="default" truncate>
          {label}
        </Text>
      </div>
    </button>
  );
}

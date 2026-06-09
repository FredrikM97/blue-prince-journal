import { useEffect, useRef, useState } from "react";
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

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button ref={btnRef} type="button" onClick={onClick} className={thumbClass}>
      <StoredImageView
        id={imageId}
        alt={imageName}
        className="images-thumb-image"
        mode="thumb"
        lazy={!visible}
      />
      <div className="images-thumb-overlay">
        <Text as="div" size="xs" tone="default" variant="default" truncate>
          {label}
        </Text>
      </div>
    </button>
  );
}

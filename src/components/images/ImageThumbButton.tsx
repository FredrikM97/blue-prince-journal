import { useEffect, useRef, useState } from "react";
import { StoredImageView } from "@/components/common/StoredImageView";
import { Text } from "@/components/common/Typography";

export function ImageThumbButton({
  imageId,
  imageName,
  imageBlob,
  label,
  selected,
  onClick,
}: {
  imageId: string;
  imageName: string;
  imageBlob: Blob;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  let thumbClass =
    "group relative aspect-square overflow-hidden rounded border border-border bg-card hover:border-brass";
  if (selected) {
    thumbClass =
      "group relative aspect-square overflow-hidden rounded border border-brass bg-card ring-1 ring-brass/40";
  }

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
        blob={imageBlob}
        className="h-full w-full object-cover"
        mode="thumb"
        lazy={!visible}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background to-transparent p-2 text-left">
        <Text as="div" size="xs" tone="default" variant="default" truncate>
          {label}
        </Text>
      </div>
    </button>
  );
}

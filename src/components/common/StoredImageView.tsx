import { useStoredImageUrl } from "@/hooks/useStoredImageUrl";

export function StoredImageView({
  id,
  className,
  alt,
  mode = "full",
  lazy = false,
}: {
  id: string;
  className?: string;
  alt?: string;
  mode?: "full" | "thumb";
  lazy?: boolean;
}) {
  const url = useStoredImageUrl({ id, mode, lazy });

  let loading: "lazy" | "eager" | undefined;
  if (mode === "thumb") loading = "lazy";
  if (!url) return <div className={`bg-muted ${className ?? ""}`} />;
  return <img src={url} alt={alt ?? ""} className={className} loading={loading} decoding="async" />;
}
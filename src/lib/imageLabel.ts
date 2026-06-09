export type ImageLabelSource = {
  name: string;
  caption?: string | null;
};

export function getImageLabel(image: ImageLabelSource): string {
  return image.caption?.trim() || image.name;
}
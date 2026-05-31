import type { ProjectImage } from "@/content/types";

export function isVideoSrc(src: string): boolean {
  return /\.mp4$/i.test(src);
}

export function isPreOptimizedSrc(src: string): boolean {
  return /\.(webp|gif|mp4)$/i.test(src);
}

type ImageLayout = Pick<
  ProjectImage,
  "displayWidthRef" | "displayHeightRef" | "marginLeftRef" | "marginTopRef"
>;

export function projectAsset(
  base: string,
  file: string,
  alt: string,
  naturalWidth: number,
  naturalHeight: number,
  width?: ProjectImage["width"],
  layout?: ImageLayout
): ProjectImage {
  return {
    src: `${base}/${file}`,
    alt,
    naturalWidth,
    naturalHeight,
    width,
    ...layout,
  };
}

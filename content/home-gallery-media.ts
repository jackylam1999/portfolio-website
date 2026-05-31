/** Per-asset display overrides for home gallery media. */
export type HomeGalleryMediaOverride = {
  /** Scale factor to crop embedded letterboxing (horizontal). */
  videoScaleX?: number;
  /** Natural dimensions when file metadata differs from pool defaults. */
  width?: number;
  height?: number;
};

export const homeGalleryMediaOverrides: Record<string, HomeGalleryMediaOverride> = {
  "/images/projects/eternal-voyage/future report.mp4": {
    /* Source frame is ~17% content width; 1/0.17 ≈ 5.8 crops letterbox at tile width */
    videoScaleX: 5.8,
    width: 1920,
    height: 1080,
  },
};

export function getHomeGalleryMediaOverride(
  src: string
): HomeGalleryMediaOverride | undefined {
  return homeGalleryMediaOverrides[src];
}

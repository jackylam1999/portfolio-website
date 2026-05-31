/** Per-asset display overrides for home gallery media. */
export type HomeGalleryMediaOverride = {
  /**
   * Fraction of frame width that contains non-letterbox content (0–1).
   * Used for tile aspect-ratio + object-fit:cover horizontal crop.
   */
  contentWidthRatio?: number;
  /** Natural dimensions when file metadata differs from pool defaults. */
  width?: number;
  height?: number;
};

export const homeGalleryMediaOverrides: Record<string, HomeGalleryMediaOverride> = {
  "/images/projects/eternal-voyage/future report.mp4": {
    /* Measured 2026-06-01: content cols 559–1362 in 1920×1080 frame (804px wide) */
    contentWidthRatio: 804 / 1920,
    width: 1920,
    height: 1080,
  },
};

export function getHomeGalleryMediaOverride(
  src: string
): HomeGalleryMediaOverride | undefined {
  return homeGalleryMediaOverrides[src];
}

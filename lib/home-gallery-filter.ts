import type { HomeGalleryPoolEntry } from "@/content/home-gallery-pool";
import { isHomeGalleryLineDrawing } from "@/content/home-gallery-pool";
import scores from "@/content/home-gallery-scores.json";

/** Line-drawing classifier threshold — keep photos/renders only. */
const SCORE_THRESHOLD = 0.48;

function poolKey(entry: HomeGalleryPoolEntry): string {
  return `${entry.base.replace(/^\//, "")}/${entry.file}`;
}

export function filterHomeGalleryPool(
  pool: HomeGalleryPoolEntry[]
): HomeGalleryPoolEntry[] {
  return pool.filter((entry) => {
    if (isHomeGalleryLineDrawing(entry.file)) return false;
    const score = scores[poolKey(entry) as keyof typeof scores];
    if (typeof score === "number" && score >= SCORE_THRESHOLD) return false;
    return true;
  });
}

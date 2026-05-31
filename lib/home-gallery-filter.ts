import type { HomeGalleryPoolEntry } from "@/content/home-gallery-pool";
import { isHomeGalleryLineDrawing } from "@/content/home-gallery-pool";
import {
  classifyPublicAsset,
  LINE_DRAWING_THRESHOLD,
} from "@/lib/line-drawing-classifier";

export async function filterHomeGalleryPool(
  pool: HomeGalleryPoolEntry[]
): Promise<HomeGalleryPoolEntry[]> {
  const results = await Promise.all(
    pool.map(async (entry) => {
      if (isHomeGalleryLineDrawing(entry.file)) {
        return null;
      }
      const src = `${entry.base}/${entry.file}`;
      const analysis = await classifyPublicAsset(src, LINE_DRAWING_THRESHOLD);
      if (analysis.isLineDrawing) {
        return null;
      }
      return entry;
    })
  );

  return results.filter((entry): entry is HomeGalleryPoolEntry => entry !== null);
}

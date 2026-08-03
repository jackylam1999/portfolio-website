import type { ProjectImage, ProjectSection } from "@/content/types";
import { imageDisplayWidthRef } from "@/lib/image-layout";
import type { ProjectGrid } from "@/content/grid/registry";

export type CompositionPiece = {
  img: ProjectImage;
  /** Position inside the composition frame (2560 ref px). */
  x: number;
  y: number;
  w: number;
  h: number;
};

export type CompositionLayout = {
  /** Frame origin in the image column (2560 ref). */
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  pieces: CompositionPiece[];
};

/**
 * Vertical gap (2560 ref) that ends a composition cluster and starts a new
 * stacked drawing. Corridor legends use ~120; overview history uses ~604.
 */
const COMPOSITION_STACK_BREAK_REF = 280;

/** Height on the 2560 canvas from width + natural/crop aspect. */
export function imageHeightRef(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): number {
  if (img.displayHeightRef != null) return img.displayHeightRef;
  const w = imageDisplayWidthRef(slug, sectionId, img, grid);
  const nw = img.naturalWidth ?? 1600;
  const nh = img.naturalHeight ?? 1200;
  return (w * nh) / nw;
}

/**
 * Lay out composition pieces using the same flex-stack + marginTop rules
 * as the desktop column, then normalize into a tight bounding frame.
 */
export function layoutComposition(
  slug: string,
  sectionId: string,
  images: ProjectImage[],
  grid?: ProjectGrid
): CompositionLayout {
  let cursorY = 0;
  const placed: CompositionPiece[] = [];

  images.forEach((img, i) => {
    const w = imageDisplayWidthRef(slug, sectionId, img, grid);
    const h = imageHeightRef(slug, sectionId, img, grid);
    const x = img.marginLeftRef ?? 0;
    const mt = i === 0 ? 0 : (img.marginTopRef ?? 0);
    const y = i === 0 ? 0 : cursorY + mt;
    placed.push({ img, x, y, w, h });
    cursorY = y + h;
  });

  const minX = Math.min(...placed.map((p) => p.x));
  const minY = Math.min(...placed.map((p) => p.y));
  const maxX = Math.max(...placed.map((p) => p.x + p.w));
  const maxY = Math.max(...placed.map((p) => p.y + p.h));

  return {
    frameX: minX,
    frameY: minY,
    frameW: Math.max(1, maxX - minX),
    frameH: Math.max(1, maxY - minY),
    pieces: placed.map((p) => ({
      ...p,
      x: p.x - minX,
      y: p.y - minY,
    })),
  };
}

export function sectionIsComposition(section: ProjectSection): boolean {
  if (section.imageCycleMs) return false;
  if (section.asComposition) return true;
  const images = section.images ?? [];
  if (images.length < 2) return false;
  // Whole section is one drawing when every image after the first stays
  // inside the composition cluster (pull-ups + short legend gaps).
  return autoClusterLength(images, 0) === images.length;
}

/** How many images from `start` belong to one spatial composition. */
function autoClusterLength(images: ProjectImage[], start: number): number {
  if (start >= images.length) return 0;
  let len = 1;
  let i = start + 1;
  while (i < images.length) {
    const mt = images[i].marginTopRef ?? 0;
    if (mt < 0) {
      len += 1;
      i += 1;
      continue;
    }
    // After a pull-up cluster has begun, absorb short gaps (legends).
    if (len > 1 && mt < COMPOSITION_STACK_BREAK_REF) {
      len += 1;
      i += 1;
      continue;
    }
    break;
  }
  // A lone image with no pull-up follow-ups is not a composition.
  if (len === 1) return 1;
  // If we only absorbed positive gaps without any pull-up, not a composition.
  const hadPullUp = images
    .slice(start + 1, start + len)
    .some((img) => (img.marginTopRef ?? 0) < 0);
  return hadPullUp ? len : 1;
}

/**
 * Group a section's images into singles vs compositions.
 * - asComposition → one composition of all images
 * - consecutive images sharing compositionId → one composition
 * - else auto-cluster by negative marginTop (+ short legend gaps)
 * - else each image alone
 */
export function groupSectionImages(section: ProjectSection): Array<
  | { type: "single"; image: ProjectImage }
  | { type: "composition"; images: ProjectImage[] }
> {
  const images = section.images ?? [];
  if (!images.length) return [];

  if (section.imageCycleMs && images.length > 1) {
    return [{ type: "composition", images }];
  }

  if (section.asComposition) {
    return [{ type: "composition", images }];
  }

  const groups: Array<
    | { type: "single"; image: ProjectImage }
    | { type: "composition"; images: ProjectImage[] }
  > = [];

  let i = 0;
  while (i < images.length) {
    const id = images[i].compositionId;
    if (id) {
      const batch: ProjectImage[] = [];
      while (i < images.length && images[i].compositionId === id) {
        batch.push(images[i]);
        i += 1;
      }
      groups.push(
        batch.length > 1
          ? { type: "composition", images: batch }
          : { type: "single", image: batch[0] }
      );
      continue;
    }

    const clusterLen = autoClusterLength(images, i);
    if (clusterLen > 1) {
      groups.push({
        type: "composition",
        images: images.slice(i, i + clusterLen),
      });
      i += clusterLen;
      continue;
    }

    groups.push({ type: "single", image: images[i] });
    i += 1;
  }

  return groups;
}

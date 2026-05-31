import type { ProjectImage } from "@/content/types";
import {
  gridImageForSection,
  REF_WIDTH,
  gridConstants,
  resolveImageLayout,
  type ProjectGrid,
} from "@/content/grid/registry";

export { REF_WIDTH };

function refCss(ref: number): string {
  return `clamp(${Math.round(ref * 0.42)}px, calc(100vw * ${ref} / var(--ref-width)), ${ref}px)`;
}

/** Display width on the 2560px reference canvas. */
export function imageDisplayWidthRef(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): number {
  if (img.displayWidthRef) return img.displayWidthRef;
  return resolveImageLayout(slug, sectionId, img, grid).w;
}

export function imageDisplayWidthCss(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): string {
  return refCss(imageDisplayWidthRef(slug, sectionId, img, grid));
}

/** Offset from the image-column origin (813px ref). */
export function imageMarginLeftCss(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): string {
  if (img.marginLeftRef != null) {
    return refCss(img.marginLeftRef);
  }
  const layout = resolveImageLayout(slug, sectionId, img, grid);
  return refCss(layout.marginLeft);
}

/** Vertical offset from natural stack position (2560 ref). */
export function imageMarginTopCss(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): string | undefined {
  const mt = img.marginTopRef ?? resolveImageLayout(slug, sectionId, img, grid).marginTop;
  if (!mt) return undefined;
  return refCss(mt);
}

export function sectionGapAfterCss(
  slug: string,
  sectionId: string,
  grid?: ProjectGrid
): string | undefined {
  const gap = gridImageForSection(slug, sectionId, grid)?.gapAfter;
  if (gap == null) return undefined;
  return refCss(gap);
}

export function imageServeMaxWidth(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): number {
  return Math.ceil(imageDisplayWidthRef(slug, sectionId, img, grid) * 2);
}

export function imageSizesAttr(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): string {
  const ref = imageDisplayWidthRef(slug, sectionId, img, grid);
  return `(max-width: ${REF_WIDTH}px) ${ref}px, ${ref}px`;
}

/** CSS aspect-ratio from grid crop box or natural image proportions. */
export function imageAspectRatioCss(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): string {
  return resolveImageLayout(slug, sectionId, img, grid).aspectRatio;
}

/** Standard placeholder width centered on the drawing axis. */
export function placeholderLayoutCss(slug: string, grid?: ProjectGrid): {
  width: string;
  marginLeft: string;
} {
  const c = gridConstants(slug, grid);
  const w = c.imageStandardWidth;
  const marginLeft = 0;
  return {
    width: refCss(w),
    marginLeft: refCss(marginLeft),
  };
}

export function imageUsesCropBox(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): boolean {
  return resolveImageLayout(slug, sectionId, img, grid).cropped;
}

/** Bottom scrollable space below project content (2560 ref px). */
export function pageBottomPaddingCss(refPx: number): string {
  return refCss(refPx);
}

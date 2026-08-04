import type { ProjectImage } from "@/content/types";
import {
  containInMaxBoxRef,
  gridImageForSection,
  imageMaxBoxHeightRef,
  imageMaxBoxWidthRef,
  REF_WIDTH,
  gridConstants,
  resolveImageLayout,
  type ProjectGrid,
} from "@/content/grid/registry";

export { REF_WIDTH };

function refCss(ref: number): string {
  const floored = Math.round(ref * 0.42);
  const lo = Math.min(floored, ref);
  const hi = Math.max(floored, ref);
  return `clamp(${lo}px, calc(100vw * ${ref} / var(--ref-width)), ${hi}px)`;
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

/**
 * Width that never exceeds the preferred display width, but shrinks when the
 * natural aspect would make the figure taller than `--site-image-max-box-height`
 * (so one drawing fits the first viewport without scrolling).
 */
export function imageViewportFitWidthCss(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): string {
  const preferred = imageDisplayWidthCss(slug, sectionId, img, grid);
  const nw = img.naturalWidth ?? 1;
  const nh = img.naturalHeight ?? 1;
  if (nh <= 0 || nw <= 0) return preferred;
  // width = height × (nw/nh); cap height via CSS var so short viewports still fit
  return `min(${preferred}, calc(var(--site-image-max-box-height) * ${nw} / ${nh}))`;
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

/** Publish-mode max box (columns A–J × rows 0–7). */
export function maxBoxWidthCss(grid?: ProjectGrid): string {
  return refCss(imageMaxBoxWidthRef(gridConstants(undefined, grid)));
}

export function maxBoxHeightCss(grid?: ProjectGrid): string {
  return refCss(imageMaxBoxHeightRef(gridConstants(undefined, grid)));
}

/** object-contain dimensions that maximize within the green max box. */
export function maxBoxContainLayoutRef(
  naturalW: number,
  naturalH: number,
  grid?: ProjectGrid
): { w: number; h: number; aspectRatio: string } {
  const c = gridConstants(undefined, grid);
  const { w, h } = containInMaxBoxRef(naturalW, naturalH, c);
  return { w, h, aspectRatio: `${w} / ${h}` };
}

export function maxBoxContainWidthCss(
  naturalW: number,
  naturalH: number,
  grid?: ProjectGrid
): string {
  return refCss(maxBoxContainLayoutRef(naturalW, naturalH, grid).w);
}

export function maxBoxContainSizesAttr(
  naturalW: number,
  naturalH: number,
  grid?: ProjectGrid
): string {
  const ref = maxBoxContainLayoutRef(naturalW, naturalH, grid).w;
  return `(max-width: ${REF_WIDTH}px) ${ref}px, ${ref}px`;
}

import siteGrid from "@/content/grid/site.json";
import parliamentGrid from "@/content/grid/parliament-sports-complex.json";
import symbiosisGrid from "@/content/grid/symbiosis.json";
import shackGrid from "@/content/grid/shack-in-the-paddyfield.json";
import unitsGrid from "@/content/grid/16-units-above-a-city-brewery.json";
import inflectionGrid from "@/content/grid/inflection-journal-vol-10.json";
import breatheGrid from "@/content/grid/breathe-on-the-land.json";
import stoolGrid from "@/content/grid/stool-sm-1-39-03.json";
import eternalGrid from "@/content/grid/eternal-voyage.json";
import type { ProjectImage } from "@/content/types";

export type GridConstants = typeof siteGrid.constants;

export type WidthTier = "narrow" | "standard" | "full";

/**
 * Horizontal alignment within the image area (between text gap and drawing bar).
 *
 * · left    — flush to image-area left edge (x = imageAreaLeft)
 * · standard — centred on the standard drawing axis (left + standardWidth / 2)
 * · area    — centred in the full image area
 * · right   — flush to image-area right edge
 *
 * Legacy names origin / drawing / photo are still accepted.
 */
export type GridAlign =
  | "left"
  | "standard"
  | "area"
  | "right"
  | "origin"
  | "drawing"
  | "drawing-left"
  | "photo";

export type GridImageEntry = {
  w?: number;
  widthTier?: WidthTier;
  /** Crop-box height for Readymag-style floor-plan strips. */
  h?: number;
  align?: GridAlign;
  x?: number;
  gapAfter?: number;
  /** Vertical offset below natural position in section (2560 ref px). */
  marginTop?: number;
};

export type ProjectGrid = {
  refWidth?: number;
  constants?: Partial<GridConstants>;
  /** Scrollable space below last drawing (2560 ref px). Default 200. */
  pageBottom?: number;
  images?: Record<string, GridImageEntry>;
};

export const DEFAULT_PAGE_BOTTOM_REF = 200;

export type ResolvedImageLayout = {
  w: number;
  x: number;
  marginLeft: number;
  marginTop: number;
  align: GridAlign;
  aspectRatio: string;
  gapAfter?: number;
  cropped: boolean;
};

const PROJECT_GRIDS: Record<string, ProjectGrid> = {
  "parliament-sports-complex": parliamentGrid,
  symbiosis: symbiosisGrid,
  "shack-in-the-paddyfield": shackGrid,
  "16-units-above-a-city-brewery": unitsGrid,
  "inflection-journal-vol-10": inflectionGrid,
  "breathe-on-the-land": breatheGrid,
  "stool-sm-1-39-03": stoolGrid,
  "eternal-voyage": eternalGrid,
};

export const REF_WIDTH = siteGrid.refWidth;

export function getProjectGrid(slug: string, grid?: ProjectGrid): ProjectGrid {
  if (grid) return grid;
  return PROJECT_GRIDS[slug] ?? {};
}

/** Webpack-bundled grid JSON — stale after editor save until rebuild. */
export function getBundledProjectGrid(slug: string): ProjectGrid {
  return PROJECT_GRIDS[slug] ?? {};
}

/** Bottom padding below project content (2560 ref px). */
export function getPageBottomRef(slug: string, grid?: ProjectGrid): number {
  const v = getProjectGrid(slug, grid).pageBottom;
  return typeof v === "number" && v >= 0 ? v : DEFAULT_PAGE_BOTTOM_REF;
}

export function gridConstants(slug?: string, grid?: ProjectGrid): GridConstants {
  const project = grid ?? (slug ? getBundledProjectGrid(slug) : {});
  return { ...siteGrid.constants, ...project.constants };
}

export function gridImageForSection(
  slug: string,
  sectionId: string,
  grid?: ProjectGrid
): GridImageEntry | undefined {
  return getProjectGrid(slug, grid).images?.[sectionId];
}

/** Standard drawing axis — centre of a standard-width image at the area left edge. */
export function standardAxisX(c: GridConstants): number {
  return c.imageAreaLeft + Math.round(c.imageStandardWidth / 2);
}

/** Right edge of the image area on the ref canvas. */
export function imageAreaRightRef(c: GridConstants): number {
  return c.imageAreaLeft + c.imageAreaWidth;
}

export function widthForTier(tier: WidthTier, c: GridConstants): number {
  if (tier === "narrow") return c.widthNarrow;
  if (tier === "full") return c.widthFull;
  return c.imageStandardWidth;
}

export function tierFromContent(img: ProjectImage): WidthTier {
  if (img.width === "narrow") return "narrow";
  if (img.width === "full") return "full";
  return "standard";
}

export function normalizeAlign(align: GridAlign | undefined, tier: WidthTier): GridAlign {
  if (!align || align === "origin") return "left";
  if (align === "drawing" || align === "drawing-left") return "standard";
  if (align === "photo") return tier === "narrow" ? "left" : "area";
  return align;
}

export function defaultAlignForTier(tier: WidthTier): GridAlign {
  if (tier === "narrow") return "left";
  return "standard";
}

export function gridImageLeftRef(
  entry: GridImageEntry,
  constants: GridConstants,
  w: number
): number {
  if (entry.x != null) return entry.x;

  const align = normalizeAlign(
    entry.align ?? defaultAlignForTier(entry.widthTier ?? "standard"),
    entry.widthTier ?? "standard"
  );
  const left = constants.imageAreaLeft;
  const areaW = constants.imageAreaWidth;

  if (align === "left") return left;
  if (align === "right") return left + areaW - w;
  if (align === "area") return left + Math.round((areaW - w) / 2);
  // standard — centred on the standard drawing axis
  return standardAxisX(constants) - Math.round(w / 2);
}

export function gridMarginLeftRef(
  entry: GridImageEntry,
  constants: GridConstants,
  w: number
): number {
  return clampToImageArea(gridImageLeftRef(entry, constants, w), w, constants).x -
    constants.imageAreaLeft;
}

/** Keep image box inside the image area (orange boundaries on the overlay). */
export function clampToImageArea(
  x: number,
  w: number,
  constants: GridConstants
): { x: number; w: number } {
  const left = constants.imageAreaLeft;
  const right = imageAreaRightRef(constants);
  const clampedW = Math.min(w, constants.imageAreaWidth);
  const clampedX = Math.max(left, Math.min(x, right - clampedW));
  return { x: clampedX, w: clampedW };
}

function mergeGridEntry(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): GridImageEntry {
  const measured = gridImageForSection(slug, sectionId, grid);
  const tier = tierFromContent(img);
  if (img.displayWidthRef != null) {
    const c = gridConstants(slug, grid);
    return {
      widthTier: tier,
      align: defaultAlignForTier(tier),
      ...measured,
      w: img.displayWidthRef,
      h: img.displayHeightRef ?? measured?.h,
      x:
        img.marginLeftRef != null
          ? c.imageAreaLeft + img.marginLeftRef
          : measured?.x,
      marginTop: img.marginTopRef ?? measured?.marginTop,
    };
  }
  if (measured) {
    return {
      widthTier: tier,
      align: defaultAlignForTier(tier),
      ...measured,
      marginTop: img.marginTopRef ?? measured.marginTop,
    };
  }
  return {
    widthTier: tier,
    align: defaultAlignForTier(tier),
    marginTop: img.marginTopRef,
  };
}

export function resolveImageLayout(
  slug: string,
  sectionId: string,
  img: ProjectImage,
  grid?: ProjectGrid
): ResolvedImageLayout {
  const c = gridConstants(slug, grid);
  const entry = mergeGridEntry(slug, sectionId, img, grid);
  const tier = entry.widthTier ?? tierFromContent(img);
  const rawW = entry.w ?? widthForTier(tier, c);
  const rawX = gridImageLeftRef(entry, c, rawW);
  const { x, w } = clampToImageArea(rawX, rawW, c);
  const marginLeft = x - c.imageAreaLeft;
  const align = normalizeAlign(entry.align ?? defaultAlignForTier(tier), tier);

  const naturalW = img.naturalWidth ?? 1600;
  const naturalH = img.naturalHeight ?? 1200;
  const cropped = entry.h != null;
  const aspectRatio = cropped
    ? `${w} / ${entry.h}`
    : `${naturalW} / ${naturalH}`;

  return {
    w,
    x,
    marginLeft,
    marginTop: entry.marginTop ?? 0,
    align,
    aspectRatio,
    gapAfter: entry.gapAfter,
    cropped,
  };
}

export function defaultGridEntry(
  img: { width?: "narrow" | "wide" | "full" },
  constants: GridConstants
): GridImageEntry {
  const tier: WidthTier =
    img.width === "narrow" ? "narrow" : img.width === "full" ? "full" : "standard";
  return {
    widthTier: tier,
    align: defaultAlignForTier(tier),
    w: widthForTier(tier, constants),
  };
}

/** Half-module step (149 → 74.5px @ ref). */
export function gridSubdivision(c: GridConstants): number {
  return c.gridSubdivision ?? 2;
}

export function gridSubunit(c: GridConstants): number {
  return c.gridUnit / gridSubdivision(c);
}

export type GridLine = { pos: number; major: boolean };

/** Vertical subdivision lines inside the image area (for overlay). */
export function imageAreaSubdivisionLines(c: GridConstants): GridLine[] {
  const sub = gridSubunit(c);
  const left = c.imageAreaLeft;
  const right = imageAreaRightRef(c);
  const lines: GridLine[] = [];
  for (let n = 0; ; n++) {
    const x = left + n * sub;
    if (x > right + 0.5) break;
    lines.push({ pos: x, major: n % gridSubdivision(c) === 0 });
  }
  return lines;
}

/** Horizontal subdivision lines from content top (for overlay). */
export function horizontalSubdivisionLines(
  c: GridConstants,
  maxY: number
): GridLine[] {
  const sub = gridSubunit(c);
  const origin = c.contentTop;
  const lines: GridLine[] = [];
  for (let n = 0; ; n++) {
    const y = origin + n * sub;
    if (y > maxY) break;
    lines.push({ pos: y, major: n % gridSubdivision(c) === 0 });
  }
  return lines;
}

/** Grid subdivision positions inside the image area (major module lines only). */
export function imageAreaGridLines(c: GridConstants): number[] {
  return imageAreaSubdivisionLines(c)
    .filter((line) => line.major)
    .map((line) => line.pos);
}

export type GridReferenceLabel = { pos: number; label: string };

/** Major vertical columns in the image area — A, B, C… from the left edge. */
export function gridColumnLabels(c: GridConstants): GridReferenceLabel[] {
  return imageAreaSubdivisionLines(c)
    .filter((line) => line.major)
    .map((line, i) => ({
      pos: line.pos,
      label: String.fromCharCode(65 + i),
    }));
}

/** Major horizontal rows from content top — 1, 2, 3… */
export function gridRowLabels(
  c: GridConstants,
  maxY: number
): GridReferenceLabel[] {
  return horizontalSubdivisionLines(c, maxY)
    .filter((line) => line.major)
    .map((line, i) => ({
      pos: line.pos,
      label: String(i + 1),
    }));
}

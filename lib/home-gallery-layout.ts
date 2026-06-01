import type { ProjectImage } from "@/content/types";
import { projectAsset } from "@/lib/project-media";
import type { HomeGalleryPoolEntry } from "@/content/home-gallery-pool";

/** FALA home thumb widths at 2560px reference (from Readymag measurements). */
export const HOME_GRID_COLS = 12;

export type ThumbTier = "sm" | "md" | "lg";

export type HomeGalleryItem = {
  slug: string;
  title: string;
  image: ProjectImage;
  widthTier: ThumbTier;
};

export type HomeGalleryRow = {
  items: HomeGalleryItem[];
  justify: "flex-start" | "flex-end" | "center" | "space-between";
};

const TIER_REF_PX: Record<ThumbTier, number> = {
  sm: 338,
  md: 688,
  lg: 989,
};

/** Max row content width on 2560 canvas (inside margins). */
const ROW_REF_MAX = 2380;
const ROW_GAP_REF = 48;

type Rng = () => number;

export function mulberry32(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed(): number {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0]!;
  }
  return (Math.random() * 0xffffffff) >>> 0;
}

function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]!;
}

function shuffle<T>(rng: Rng, arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function rowWidthRef(tiers: ThumbTier[]): number {
  if (!tiers.length) return 0;
  const images = tiers.reduce((sum, t) => sum + TIER_REF_PX[t], 0);
  const gaps = (tiers.length - 1) * ROW_GAP_REF;
  return images + gaps;
}

function tiersFit(tiers: ThumbTier[]): boolean {
  return rowWidthRef(tiers) <= ROW_REF_MAX;
}

/** Tier combos that fit one row on the FALA canvas — lg/md only (no sm rows). */
const ROW_TIER_BAGS: ThumbTier[][] = [
  ["lg"],
  ["md"],
  ["lg", "md"],
  ["md", "md"],
];

function pickRowTiers(count: number, rng: Rng): ThumbTier[] {
  const candidates = ROW_TIER_BAGS.filter((bag) => bag.length === count && tiersFit(bag));
  if (candidates.length) return [...pick(rng, candidates)];
  if (count > 1) return pickRowTiers(count - 1, rng);
  return [pick(rng, ["md", "lg"] as const)];
}

function buildRowCounts(itemCount: number, rng: Rng): number[] {
  const counts: number[] = [];
  let remaining = itemCount;
  while (remaining > 0) {
    const max = Math.min(2, remaining);
    const options: number[] = [];
    for (let c = 1; c <= max; c++) {
      if (ROW_TIER_BAGS.some((bag) => bag.length === c)) options.push(c);
    }
    const count = options.length ? pick(rng, options) : 1;
    counts.push(Math.min(count, remaining));
    remaining -= count;
  }
  return counts;
}

function rowJustify(count: number, rng: Rng): HomeGalleryRow["justify"] {
  if (count === 1) return pick(rng, ["flex-start", "center", "flex-end"] as const);
  if (count === 2) return pick(rng, ["flex-start", "space-between", "flex-end"] as const);
  return pick(rng, ["flex-start", "space-between"] as const);
}

function toGalleryItem(entry: HomeGalleryPoolEntry, tier: ThumbTier): HomeGalleryItem {
  return {
    slug: entry.slug,
    title: entry.title,
    image: projectAsset(entry.base, entry.file, entry.alt, entry.w, entry.h),
    widthTier: tier,
  };
}

export function buildHomeGalleryLayout(
  pool: HomeGalleryPoolEntry[],
  seed: number = randomSeed()
): HomeGalleryRow[] {
  const rng = mulberry32(seed);
  const shuffled = shuffle(rng, pool);
  const rowCounts = buildRowCounts(shuffled.length, rng);
  const rows: HomeGalleryRow[] = [];
  let cursor = 0;

  for (const count of rowCounts) {
    const slice = shuffled.slice(cursor, cursor + count);
    cursor += count;
    const tiers = pickRowTiers(count, rng);
    const items = slice.map((entry, i) => toGalleryItem(entry, tiers[i]!));
    rows.push({ items, justify: rowJustify(count, rng) });
  }

  return rows;
}

export function validateHomeGalleryLayout(rows: HomeGalleryRow[]): string[] {
  const errors: string[] = [];

  for (const [ri, row] of rows.entries()) {
    if (!tiersFit(row.items.map((i) => i.widthTier))) {
      errors.push(`Row ${ri + 1}: tiers exceed FALA row width`);
    }
    if (row.items.length > 2) {
      errors.push(`Row ${ri + 1}: more than 2 items`);
    }
  }

  return errors;
}

export function thumbServeWidth(tier: ThumbTier): number {
  return TIER_REF_PX[tier];
}

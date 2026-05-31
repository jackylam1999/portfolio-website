import type { ProjectImage } from "@/content/types";
import { projectAsset } from "@/lib/project-media";
import type { HomeGalleryPoolEntry } from "@/content/home-gallery-pool";

/** 12-column grid — dense vertical rhythm, FALA-style horizontal spread. */
export const HOME_GRID_COLS = 12;

export type HomeGalleryItem = {
  slug: string;
  title: string;
  image: ProjectImage;
  colStart: number;
  colSpan: number;
  offsetSubunits: number;
};

export type HomeGalleryRow = {
  items: HomeGalleryItem[];
};

type Rng = () => number;

type Slot = { colStart: number; colSpan: number };

/** Curated row templates — guaranteed left / center / right spread on 12 cols. */
const ROW_TEMPLATES: Record<1 | 2 | 3 | 4, Slot[][]> = {
  1: [
    [{ colStart: 1, colSpan: 5 }],
    [{ colStart: 1, colSpan: 6 }],
    [{ colStart: 4, colSpan: 5 }],
    [{ colStart: 4, colSpan: 6 }],
    [{ colStart: 7, colSpan: 5 }],
    [{ colStart: 8, colSpan: 5 }],
  ],
  2: [
    [
      { colStart: 1, colSpan: 4 },
      { colStart: 8, colSpan: 5 },
    ],
    [
      { colStart: 1, colSpan: 5 },
      { colStart: 7, colSpan: 6 },
    ],
    [
      { colStart: 1, colSpan: 3 },
      { colStart: 9, colSpan: 4 },
    ],
    [
      { colStart: 2, colSpan: 4 },
      { colStart: 8, colSpan: 4 },
    ],
    [
      { colStart: 1, colSpan: 6 },
      { colStart: 8, colSpan: 4 },
    ],
    [
      { colStart: 1, colSpan: 4 },
      { colStart: 6, colSpan: 5 },
    ],
  ],
  3: [
    [
      { colStart: 1, colSpan: 3 },
      { colStart: 5, colSpan: 3 },
      { colStart: 9, colSpan: 4 },
    ],
    [
      { colStart: 1, colSpan: 4 },
      { colStart: 5, colSpan: 4 },
      { colStart: 9, colSpan: 4 },
    ],
    [
      { colStart: 1, colSpan: 3 },
      { colStart: 4, colSpan: 4 },
      { colStart: 9, colSpan: 4 },
    ],
    [
      { colStart: 1, colSpan: 4 },
      { colStart: 6, colSpan: 3 },
      { colStart: 10, colSpan: 3 },
    ],
  ],
  4: [
    [
      { colStart: 1, colSpan: 3 },
      { colStart: 4, colSpan: 3 },
      { colStart: 7, colSpan: 3 },
      { colStart: 10, colSpan: 3 },
    ],
    [
      { colStart: 1, colSpan: 2 },
      { colStart: 4, colSpan: 3 },
      { colStart: 7, colSpan: 3 },
      { colStart: 10, colSpan: 3 },
    ],
    [
      { colStart: 1, colSpan: 3 },
      { colStart: 4, colSpan: 2 },
      { colStart: 7, colSpan: 3 },
      { colStart: 10, colSpan: 3 },
    ],
  ],
};

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

function buildRowCounts(itemCount: number, rng: Rng): number[] {
  const bag: number[] = [];
  while (bag.length < itemCount + 12) {
    bag.push(1, 2, 3, 4);
  }
  shuffle(rng, bag);

  const counts: number[] = [];
  let remaining = itemCount;
  let i = 0;
  while (remaining > 0) {
    let count = bag[i++] ?? pick(rng, [1, 2, 3, 4]);
    if (count > remaining) count = remaining;
    counts.push(count);
    remaining -= count;
  }
  return counts;
}

function pickRowTemplate(
  rng: Rng,
  count: 1 | 2 | 3 | 4,
  previousStarts: number[]
): Slot[] {
  const templates = ROW_TEMPLATES[count];
  const fresh = templates.filter((t) =>
    t.every((slot) => !previousStarts.includes(slot.colStart))
  );
  const pool = fresh.length ? fresh : templates;
  return pick(rng, pool).map((slot) => ({ ...slot }));
}

function toGalleryItem(
  entry: HomeGalleryPoolEntry,
  slot: Slot
): HomeGalleryItem {
  return {
    slug: entry.slug,
    title: entry.title,
    image: projectAsset(entry.base, entry.file, entry.alt, entry.w, entry.h),
    colStart: slot.colStart,
    colSpan: slot.colSpan,
    offsetSubunits: 0,
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
  let previousStarts: number[] = [];

  for (const count of rowCounts) {
    const slice = shuffled.slice(cursor, cursor + count);
    cursor += count;
    const slots = pickRowTemplate(rng, count as 1 | 2 | 3 | 4, previousStarts);
    const items = slice.map((entry, i) => toGalleryItem(entry, slots[i]!));
    previousStarts = items.map((item) => item.colStart);
    rows.push({ items });
  }

  return rows;
}

/** Layout QA — used by verify script and tests. */
export function validateHomeGalleryLayout(rows: HomeGalleryRow[]): string[] {
  const errors: string[] = [];
  const counts = rows.map((r) => r.items.length);
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const c of counts) {
    if (c >= 1 && c <= 4) distribution[c as 1 | 2 | 3 | 4]++;
  }
  if (distribution[1] > distribution[3] + 2 && distribution[1] > distribution[4]) {
    errors.push("Too many single-image rows");
  }

  let prevStarts: number[] = [];
  for (const [ri, row] of rows.entries()) {
    const starts = row.items.map((i) => i.colStart);
    const maxEnd = Math.max(...row.items.map((i) => i.colStart + i.colSpan - 1));
    if (maxEnd < 8) errors.push(`Row ${ri + 1} does not reach the right side (max col ${maxEnd})`);
    if (starts.every((s) => s <= 2)) {
      errors.push(`Row ${ri + 1} is entirely left-clustered`);
    }
    if (prevStarts.length && starts.join() === prevStarts.join()) {
      errors.push(`Row ${ri + 1} repeats previous row column starts`);
    }
    prevStarts = starts;

    for (const item of row.items) {
      if (item.colSpan < 2) errors.push(`Row ${ri + 1}: span ${item.colSpan} too narrow`);
    }
  }

  const allStarts = rows.flatMap((r) => r.items.map((i) => i.colStart));
  const hasLeft = allStarts.some((s) => s <= 2);
  const hasCenter = allStarts.some((s) => s >= 4 && s <= 6);
  const hasRight = allStarts.some((s) => s >= 8);
  if (!hasLeft || !hasCenter || !hasRight) {
    errors.push("Layout missing left, center, or right coverage");
  }

  return errors;
}

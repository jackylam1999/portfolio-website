import type { ProjectImage } from "@/content/types";
import { projectAsset } from "@/lib/project-media";
import type { HomeGalleryPoolEntry } from "@/content/home-gallery-pool";

/** 12-column grid — dense vertical rhythm, FALA-style horizontal spread. */
export const HOME_GRID_COLS = 12;

/** Minimum empty column tracks between adjacent images in a row. */
export const HOME_MIN_COL_GAP = 2;

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
type Zone = "left" | "center" | "right";

const MIN_SPAN = 2;
const MAX_SPAN = 5;

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

/** Independent uniform random 1–4 per row (not a repeating bag pattern). */
function buildRowCounts(itemCount: number, rng: Rng): number[] {
  const counts: number[] = [];
  let remaining = itemCount;
  while (remaining > 0) {
    const max = Math.min(4, remaining);
    const options: number[] = [];
    for (let c = 1; c <= max; c++) {
      if (maxItemsForGap(c, minSpanForCount(c))) options.push(c);
    }
    const count = options.length
      ? pick(rng, options)
      : Math.min(1, remaining);
    counts.push(count);
    remaining -= count;
  }
  return counts;
}

function maxItemsForGap(count: number, minSpan = MIN_SPAN): boolean {
  const total = count * minSpan + Math.max(0, count - 1) * HOME_MIN_COL_GAP;
  return total <= HOME_GRID_COLS;
}

function minSpanForCount(_count: number): number {
  return MIN_SPAN;
}

function assignSpans(rng: Rng, count: number): number[] {
  const minSpan = minSpanForCount(count);
  const spans: number[] = [];
  for (let i = 0; i < count; i++) {
    const maxSpan = Math.min(MAX_SPAN, HOME_GRID_COLS - (count - 1) * HOME_MIN_COL_GAP - (count - 1 - i) * minSpan);
    const span = minSpan + Math.floor(rng() * Math.max(1, maxSpan - minSpan + 1));
    spans.push(Math.max(minSpan, Math.min(span, maxSpan)));
  }
  let total = spans.reduce((a, b) => a + b, 0) + HOME_MIN_COL_GAP * (count - 1);
  while (total > HOME_GRID_COLS) {
    const idx = spans.indexOf(Math.max(...spans));
    if (spans[idx]! <= minSpan) break;
    spans[idx]!--;
    total--;
  }
  return spans;
}

function zoneForIndex(rng: Rng, index: number, count: number): Zone {
  if (count === 1) return pick(rng, ["left", "center", "right"] as const);
  if (count === 2) {
    return pick(rng, [
      ["left", "right"],
      ["left", "center"],
      ["center", "right"],
      ["right", "left"],
    ] as const)[index]!;
  }
  if (count === 3) {
    return (["left", "center", "right"] as const)[index]!;
  }
  return pick(rng, [
    ["left", "center", "center", "right"],
    ["left", "right", "left", "right"],
    ["center", "left", "right", "center"],
  ] as const)[index]!;
}

function zoneStartRange(zone: Zone, span: number): [number, number] {
  const maxStart = HOME_GRID_COLS - span + 1;
  switch (zone) {
    case "left":
      return [1, Math.min(4, maxStart)];
    case "center":
      return [Math.max(1, 4 - span + 1), Math.min(7, maxStart)];
    case "right":
      return [Math.max(1, HOME_GRID_COLS - span - 2), maxStart];
  }
}

function fits(slots: Slot[], start: number, span: number): boolean {
  const end = start + span - 1;
  for (const s of slots) {
    const sEnd = s.colStart + s.colSpan - 1;
    if (start <= sEnd + HOME_MIN_COL_GAP && end >= s.colStart - HOME_MIN_COL_GAP) {
      return false;
    }
  }
  return end <= HOME_GRID_COLS;
}

function packRow(rng: Rng, count: number, previousStarts: number[]): Slot[] {
  if (!maxItemsForGap(count, minSpanForCount(count))) {
    return packRow(rng, Math.max(1, count - 1), previousStarts);
  }

  for (let attempt = 0; attempt < 64; attempt++) {
    const spans = assignSpans(rng, count);
    const total =
      spans.reduce((a, b) => a + b, 0) + HOME_MIN_COL_GAP * (count - 1);
    if (total > HOME_GRID_COLS) continue;

    const order = shuffle(
      rng,
      Array.from({ length: count }, (_, i) => i)
    );
    const slots: Slot[] = [];
    let failed = false;

    for (const idx of order) {
      const span = spans[idx]!;
      const zone = zoneForIndex(rng, idx, count);
      const [lo, hi] = zoneStartRange(zone, span);
      const candidates: number[] = [];
      for (let start = lo; start <= hi; start++) {
        if (fits(slots, start, span)) candidates.push(start);
      }
      if (!candidates.length) {
        for (let start = 1; start <= HOME_GRID_COLS - span + 1; start++) {
          if (fits(slots, start, span)) candidates.push(start);
        }
      }
      const fresh = candidates.filter((s) => !previousStarts.includes(s));
      const pool = fresh.length ? fresh : candidates;
      if (!pool.length) {
        failed = true;
        break;
      }
      slots.push({ colStart: pick(rng, pool), colSpan: span });
    }

    if (!failed && slots.length === count) {
      return slots.sort((a, b) => a.colStart - b.colStart);
    }
  }

  // Guaranteed fallback: sequential left-to-right with min gap
  const spans = assignSpans(rng, count);
  const slots: Slot[] = [];
  let cursor = 1;
  for (const span of spans) {
    while (cursor + span - 1 <= HOME_GRID_COLS && !fits(slots, cursor, span)) {
      cursor++;
    }
    slots.push({ colStart: cursor, colSpan: span });
    cursor += span + HOME_MIN_COL_GAP;
  }
  return slots;
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
    const slots = packRow(rng, count, previousStarts);
    const items = slice.map((entry, i) => toGalleryItem(entry, slots[i]!));
    previousStarts = items.map((item) => item.colStart);
    rows.push({ items });
  }

  return rows;
}

export function validateHomeGalleryLayout(rows: HomeGalleryRow[]): string[] {
  const errors: string[] = [];
  let prevStarts: number[] = [];

  for (const [ri, row] of rows.entries()) {
    const starts = row.items.map((i) => i.colStart);
    for (const item of row.items) {
      if (item.colSpan < MIN_SPAN) {
        errors.push(`Row ${ri + 1}: ${item.title} has span ${item.colSpan} (min ${MIN_SPAN})`);
      }
    }
    const maxEnd = Math.max(...row.items.map((i) => i.colStart + i.colSpan - 1));
    if (maxEnd < 8) {
      errors.push(`Row ${ri + 1} does not reach the right side (max col ${maxEnd})`);
    }

    const sorted = [...row.items].sort((a, b) => a.colStart - b.colStart);
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1]!;
      const cur = sorted[i]!;
      const gap = cur.colStart - (prev.colStart + prev.colSpan);
      if (gap < HOME_MIN_COL_GAP) {
        errors.push(
          `Row ${ri + 1}: gap ${gap} cols between items (need >= ${HOME_MIN_COL_GAP})`
        );
      }
    }

    if (prevStarts.length && starts.join() === prevStarts.join()) {
      errors.push(`Row ${ri + 1} repeats previous row column starts`);
    }
    prevStarts = starts;
  }

  return errors;
}

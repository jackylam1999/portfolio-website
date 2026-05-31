import type { ProjectImage } from "@/content/types";
import { projectAsset } from "@/lib/project-media";
import type { HomeGalleryPoolEntry } from "@/content/home-gallery-pool";

/** Fine vertical rhythm — 12 tracks so rows rarely share the same column starts. */
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

type Zone = "left" | "center" | "right";

type Rng = () => number;

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

/** Even mix of 1–4 items per row (shuffled bag, not weighted toward 1–2). */
function buildRowCounts(itemCount: number, rng: Rng): number[] {
  const bag: number[] = [];
  while (bag.length < itemCount + 8) {
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

function zoneStarts(zone: Zone, span: number): number[] {
  const maxStart = HOME_GRID_COLS - span + 1;
  const ranges: Record<Zone, [number, number]> = {
    left: [1, 5],
    center: [4, 8],
    right: [7, maxStart],
  };
  const [lo, hi] = ranges[zone];
  const starts: number[] = [];
  for (let s = lo; s <= Math.min(hi, maxStart); s++) starts.push(s);
  return starts;
}

function pickZones(rng: Rng, count: number): Zone[] {
  if (count === 1) {
    return [pick(rng, ["left", "center", "right"] as const)];
  }
  if (count === 2) {
    return pick(rng, [
      ["left", "right"],
      ["left", "center"],
      ["center", "right"],
      ["right", "left"],
      ["center", "left"],
      ["right", "center"],
    ] as const);
  }
  if (count === 3) {
    return pick(rng, [
      ["left", "center", "right"],
      ["right", "center", "left"],
      ["left", "right", "center"],
      ["center", "left", "right"],
    ] as const);
  }
  return pick(rng, [
    ["left", "center", "center", "right"],
    ["left", "left", "right", "right"],
    ["center", "left", "right", "center"],
    ["left", "center", "right", "right"],
  ] as const);
}

function overlaps(occupied: Set<number>, start: number, span: number): boolean {
  for (let c = start; c < start + span; c++) {
    if (occupied.has(c)) return true;
  }
  return false;
}

function mark(occupied: Set<number>, start: number, span: number) {
  for (let c = start; c < start + span; c++) occupied.add(c);
}

function pickStart(
  rng: Rng,
  span: number,
  occupied: Set<number>,
  zone: Zone,
  avoidStarts: number[]
): number | null {
  const preferNewLine = avoidStarts.length > 0;
  const zoneCandidates = zoneStarts(zone, span).filter(
    (s) => !overlaps(occupied, s, span)
  );
  const fresh = zoneCandidates.filter((s) => !avoidStarts.includes(s));
  const pool =
    preferNewLine && fresh.length
      ? fresh
      : zoneCandidates.length
        ? zoneCandidates
        : null;
  if (pool?.length) return pick(rng, pool);

  const any: number[] = [];
  for (let s = 1; s <= HOME_GRID_COLS - span + 1; s++) {
    if (!overlaps(occupied, s, span)) any.push(s);
  }
  if (!any.length) return null;
  const fallbackFresh = any.filter((s) => !avoidStarts.includes(s));
  return pick(rng, fallbackFresh.length ? fallbackFresh : any);
}

function assignSpans(rng: Rng, count: number): number[] {
  const spans: number[] = [];
  for (let i = 0; i < count; i++) {
    spans.push(MIN_SPAN + Math.floor(rng() * (MAX_SPAN - MIN_SPAN + 1)));
  }

  const minGap = count > 1 ? 1 : 0;
  let total = spans.reduce((a, b) => a + b, 0) + minGap * (count - 1);
  while (total > HOME_GRID_COLS) {
    const idx = spans.indexOf(Math.max(...spans));
    if (spans[idx]! <= MIN_SPAN) break;
    spans[idx]!--;
    total--;
  }
  return spans;
}

function staggerOffsets(rng: Rng, count: number): number[] {
  const offsets = Array.from({ length: count }, () => 0);
  for (let i = 0; i < count; i++) {
    if (rng() < 0.65) {
      offsets[i] = Math.floor(rng() * 4);
    }
  }
  if (count > 1 && offsets.every((o) => o === 0)) {
    offsets[Math.floor(rng() * count)] = 1 + Math.floor(rng() * 3);
  }
  return offsets;
}

function packRow(
  rng: Rng,
  count: number,
  previousStarts: number[]
): { colStart: number; colSpan: number }[] {
  const zones = pickZones(rng, count);
  const spans = assignSpans(rng, count);
  const occupied = new Set<number>();
  const slots: { colStart: number; colSpan: number; order: number }[] = [];

  for (let i = 0; i < count; i++) {
    const span = spans[i]!;
    let start = pickStart(rng, span, occupied, zones[i]!, previousStarts);
    if (start === null) {
      start = pickStart(rng, span, occupied, pick(rng, ["left", "center", "right"]), []);
    }
    if (start === null) {
      start = 1;
      while (start <= HOME_GRID_COLS - span + 1 && overlaps(occupied, start, span)) {
        start++;
      }
    }
    mark(occupied, start, span);
    slots.push({ colStart: start, colSpan: span, order: i });
  }

  return slots
    .sort((a, b) => a.colStart - b.colStart)
    .map(({ colStart, colSpan }) => ({ colStart, colSpan }));
}

function toGalleryItem(
  entry: HomeGalleryPoolEntry,
  placement: { colStart: number; colSpan: number },
  offsetSubunits: number
): HomeGalleryItem {
  return {
    slug: entry.slug,
    title: entry.title,
    image: projectAsset(
      entry.base,
      entry.file,
      entry.alt,
      entry.w,
      entry.h
    ),
    colStart: placement.colStart,
    colSpan: placement.colSpan,
    offsetSubunits,
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
    const placements = packRow(rng, count, previousStarts);
    const offsets = staggerOffsets(rng, count);
    const items = slice.map((entry, i) =>
      toGalleryItem(entry, placements[i]!, offsets[i]!)
    );
    previousStarts = items.map((item) => item.colStart);
    rows.push({ items });
  }

  return rows;
}

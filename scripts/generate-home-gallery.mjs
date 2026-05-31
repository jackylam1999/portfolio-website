#!/usr/bin/env node
/**
 * Generate a FALA-style randomized home gallery layout.
 *
 * Rules:
 * - 4-column rows, 1–4 images per row
 * - Horizontal placement varies (left / center / right / spread)
 * - Vertical stagger within rows (0–2 grid subunits)
 * - Fixed seed for reproducible output
 *
 * Usage:
 *   node scripts/generate-home-gallery.mjs
 *   node scripts/generate-home-gallery.mjs --seed 20260531
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "content/home-gallery.ts");

const COLS = 4;
const DEFAULT_SEED = 20260531;

/** Curated pool — photos, renders, GIFs, video only (no line drawings / plans). */
const POOL = [
  { slug: "parliament-sports-complex", title: "Parliament Sports Complex", base: "/images/projects/parliament-sports-complex", file: "model.webp", alt: "Parliament Sports Complex model", w: 6240, h: 4160 },
  { slug: "parliament-sports-complex", title: "Parliament Sports Complex", base: "/images/projects/parliament-sports-complex", file: "side-street.webp", alt: "Side street", w: 2000, h: 2500 },
  { slug: "parliament-sports-complex", title: "Parliament Sports Complex", base: "/images/projects/parliament-sports-complex", file: "sports-hall.webp", alt: "Sports hall", w: 2000, h: 2500 },
  { slug: "parliament-sports-complex", title: "Parliament Sports Complex", base: "/images/projects/parliament-sports-complex", file: "cricket-practice.webp", alt: "Cricket practice", w: 2000, h: 2500 },
  { slug: "16-units-above-a-city-brewery", title: "16 Units Above a City Brewery", base: "/images/projects/16-units-above-a-city-brewery", file: "summer morning.webp", alt: "Summer morning", w: 4000, h: 2500 },
  { slug: "16-units-above-a-city-brewery", title: "16 Units Above a City Brewery", base: "/images/projects/16-units-above-a-city-brewery", file: "beer garden.webp", alt: "Beer garden", w: 4000, h: 2500 },
  { slug: "16-units-above-a-city-brewery", title: "16 Units Above a City Brewery", base: "/images/projects/16-units-above-a-city-brewery", file: "facade.webp", alt: "Facade", w: 4000, h: 2500 },
  { slug: "shack-in-the-paddyfield", title: "Shack in the Paddyfield", base: "/images/projects/shack-in-the-paddyfield", file: "paddy field hut.png", alt: "Paddy field hut", w: 2000, h: 2500 },
  { slug: "shack-in-the-paddyfield", title: "Shack in the Paddyfield", base: "/images/projects/shack-in-the-paddyfield", file: "farm with the hut.webp", alt: "Farm with the hut", w: 1166, h: 1244 },
  { slug: "shack-in-the-paddyfield", title: "Shack in the Paddyfield", base: "/images/projects/shack-in-the-paddyfield", file: "hut in seasons.jpg", alt: "Hut in seasons", w: 4960, h: 1562 },
  { slug: "breathe-on-the-land", title: "Breathe on the Land", base: "/images/projects/breathe-on-the-land", file: "open air corridor.jpg", alt: "Open air corridor", w: 4000, h: 3000 },
  { slug: "breathe-on-the-land", title: "Breathe on the Land", base: "/images/projects/breathe-on-the-land", file: "main facade.png", alt: "Main facade", w: 4000, h: 1700 },
  { slug: "breathe-on-the-land", title: "Breathe on the Land", base: "/images/projects/breathe-on-the-land", file: "childcare.png", alt: "Childcare", w: 4000, h: 2700 },
  { slug: "breathe-on-the-land", title: "Breathe on the Land", base: "/images/projects/breathe-on-the-land", file: "co working.png", alt: "Co-working", w: 4000, h: 2700 },
  { slug: "breathe-on-the-land", title: "Breathe on the Land", base: "/images/projects/breathe-on-the-land", file: "grassland dosmesticity.webp", alt: "Grassland domesticity", w: 1016, h: 1224 },
  { slug: "eternal-voyage", title: "Eternal Voyage", base: "/images/projects/eternal-voyage", file: "4WD in motion 2.png", alt: "4WD in motion", w: 2076, h: 2768 },
  { slug: "eternal-voyage", title: "Eternal Voyage", base: "/images/projects/eternal-voyage", file: "4WD on thte field 1.png", alt: "4WD on the field", w: 4961, h: 7016 },
  { slug: "eternal-voyage", title: "Eternal Voyage", base: "/images/projects/eternal-voyage", file: "dam.gif", alt: "Dam", w: 553, h: 737 },
  { slug: "eternal-voyage", title: "Eternal Voyage", base: "/images/projects/eternal-voyage", file: "water infrastrucutre.png", alt: "Water infrastructure", w: 1500, h: 3074 },
  { slug: "eternal-voyage", title: "Eternal Voyage", base: "/images/projects/eternal-voyage", file: "future report.mp4", alt: "Future report", w: 1920, h: 1080 },
  { slug: "eternal-voyage", title: "Eternal Voyage", base: "/images/projects/eternal-voyage", file: "ranger station 1.png", alt: "Ranger station", w: 4961, h: 7016 },
  { slug: "16-units-above-a-city-brewery", title: "16 Units Above a City Brewery", base: "/images/projects/16-units-above-a-city-brewery", file: "history 1.webp", alt: "History", w: 4000, h: 2500 },
  { slug: "eternal-voyage", title: "Eternal Voyage", base: "/images/projects/eternal-voyage", file: "4WD in motion 1.gif", alt: "4WD in motion", w: 516, h: 688 },
  { slug: "eternal-voyage", title: "Eternal Voyage", base: "/images/projects/eternal-voyage", file: "station to wetland 1.gif", alt: "Station to wetland", w: 553, h: 737 },
  { slug: "shack-in-the-paddyfield", title: "Shack in the Paddyfield", base: "/images/projects/shack-in-the-paddyfield", file: "sabusawa rice - traditional craft.webp", alt: "Sabusawa rice craft", w: 1752, h: 744 },
  { slug: "shack-in-the-paddyfield", title: "Shack in the Paddyfield", base: "/images/projects/shack-in-the-paddyfield", file: "context mapping.jpg", alt: "Context mapping", w: 3323, h: 2918 },
];

function parseArgs() {
  const seedArg = process.argv.indexOf("--seed");
  const seed =
    seedArg !== -1 && process.argv[seedArg + 1]
      ? Number(process.argv[seedArg + 1])
      : DEFAULT_SEED;
  return { seed };
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle(rng, arr) {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Single-item alignment presets on the 4-column grid. */
const SINGLE_ALIGNMENTS = [
  { start: 1, span: 1 },
  { start: 1, span: 2 },
  { start: 2, span: 1 },
  { start: 2, span: 2 },
  { start: 3, span: 1 },
  { start: 3, span: 2 },
  { start: 4, span: 1 },
];

/** Multi-item row templates (start + span per slot, non-overlapping). */
const ROW_TEMPLATES = {
  2: [
    [
      { start: 1, span: 1 },
      { start: 3, span: 1 },
    ],
    [
      { start: 1, span: 1 },
      { start: 4, span: 1 },
    ],
    [
      { start: 1, span: 2 },
      { start: 4, span: 1 },
    ],
    [
      { start: 1, span: 1 },
      { start: 3, span: 2 },
    ],
    [
      { start: 1, span: 1 },
      { start: 2, span: 1 },
    ],
    [
      { start: 3, span: 1 },
      { start: 4, span: 1 },
    ],
  ],
  3: [
    [
      { start: 1, span: 1 },
      { start: 2, span: 1 },
      { start: 4, span: 1 },
    ],
    [
      { start: 1, span: 1 },
      { start: 3, span: 1 },
      { start: 4, span: 1 },
    ],
    [
      { start: 1, span: 1 },
      { start: 2, span: 2 },
      { start: 4, span: 1 },
    ],
    [
      { start: 2, span: 1 },
      { start: 3, span: 1 },
      { start: 4, span: 1 },
    ],
  ],
  4: [
    [
      { start: 1, span: 1 },
      { start: 2, span: 1 },
      { start: 3, span: 1 },
      { start: 4, span: 1 },
    ],
  ],
};

function rowItemCount(rng, remaining) {
  if (remaining <= 1) return 1;
  const weights =
    remaining === 2
      ? [0.15, 0.85, 0, 0]
      : remaining === 3
        ? [0.2, 0.45, 0.35, 0]
        : [0.18, 0.32, 0.28, 0.22];
  const roll = rng();
  let acc = 0;
  for (let c = 1; c <= Math.min(4, remaining); c++) {
    acc += weights[c - 1] ?? 0;
    if (roll <= acc) return c;
  }
  return Math.min(4, remaining);
}

function placementTemplate(rng, count) {
  if (count === 1) return [pick(rng, SINGLE_ALIGNMENTS)];
  return pick(rng, ROW_TEMPLATES[count]);
}

function staggerOffsets(rng, count) {
  const offsets = Array.from({ length: count }, () => 0);
  if (count === 1) {
    offsets[0] = rng() < 0.25 ? Math.floor(rng() * 2) : 0;
    return offsets;
  }
  let staggered = 0;
  for (let i = 0; i < count; i++) {
    if (i > 0 && rng() < 0.55) {
      offsets[i] = 1 + Math.floor(rng() * 2);
      staggered++;
    }
  }
  if (staggered === 0 && count > 1) {
    offsets[Math.floor(rng() * count)] = 1 + Math.floor(rng() * 2);
  }
  return offsets;
}

function buildRows(rng, items) {
  const rows = [];
  let i = 0;
  while (i < items.length) {
    const remaining = items.length - i;
    const count = rowItemCount(rng, remaining);
    const template = placementTemplate(rng, count);
    const offsets = staggerOffsets(rng, count);
    const rowItems = [];
    for (let j = 0; j < count; j++) {
      const slot = template[j];
      rowItems.push({
        ...items[i + j],
        colStart: slot.start,
        colSpan: slot.span,
        offsetSubunits: offsets[j],
      });
    }
    rows.push({ items: rowItems });
    i += count;
  }
  return rows;
}

function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function emitTs(rows, seed) {
  const lines = [];
  lines.push("// AUTO-GENERATED by scripts/generate-home-gallery.mjs — re-run to shuffle layout.");
  lines.push(`// Seed: ${seed}`);
  lines.push('import type { ProjectImage } from "@/content/types";');
  lines.push('import { projectAsset } from "@/lib/project-media";');
  lines.push("");
  lines.push("export type HomeGalleryItem = {");
  lines.push("  slug: string;");
  lines.push("  title: string;");
  lines.push("  image: ProjectImage;");
  lines.push("  /** 1-based column start on the 4-column home grid. */");
  lines.push("  colStart: number;");
  lines.push("  /** Columns spanned (1 or 2). */");
  lines.push("  colSpan: 1 | 2;");
  lines.push("  /** Vertical stagger within the row (grid subunits). */");
  lines.push("  offsetSubunits: number;");
  lines.push("};");
  lines.push("");
  lines.push("export type HomeGalleryRow = {");
  lines.push("  items: HomeGalleryItem[];");
  lines.push("};");
  lines.push("");
  lines.push("export const homeGalleryRows: HomeGalleryRow[] = [");

  for (const row of rows) {
    lines.push("  {");
    lines.push("    items: [");
    for (const item of row.items) {
      lines.push("      {");
      lines.push(`        slug: "${esc(item.slug)}",`);
      lines.push(`        title: "${esc(item.title)}",`);
      lines.push(
        `        image: projectAsset("${item.base}", "${esc(item.file)}", "${esc(item.alt)}", ${item.w}, ${item.h}),`
      );
      lines.push(`        colStart: ${item.colStart},`);
      lines.push(`        colSpan: ${item.colSpan},`);
      lines.push(`        offsetSubunits: ${item.offsetSubunits},`);
      lines.push("      },");
    }
    lines.push("    ],");
    lines.push("  },");
  }

  lines.push("];");
  lines.push("");
  return lines.join("\n");
}

function main() {
  const { seed } = parseArgs();
  const rng = mulberry32(seed);
  const shuffled = shuffle(rng, POOL);
  const rows = buildRows(rng, shuffled);
  const ts = emitTs(rows, seed);
  fs.writeFileSync(OUT, ts, "utf8");
  const itemCount = rows.reduce((n, r) => n + r.items.length, 0);
  console.log(`Wrote ${OUT}`);
  console.log(`  ${rows.length} rows, ${itemCount} items (seed ${seed})`);
}

main();

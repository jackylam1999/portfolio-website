#!/usr/bin/env node
/**
 * QA check for home gallery layout (FALA thumb rows).
 */
import { homeGalleryPool } from "../content/home-gallery-pool.ts";
import {
  buildHomeGalleryLayout,
  validateHomeGalleryLayout,
} from "../lib/home-gallery-layout.ts";
import { filterHomeGalleryPool } from "../lib/home-gallery-filter.ts";

const seedArg = process.argv.indexOf("--seed");
const seed =
  seedArg !== -1 && process.argv[seedArg + 1]
    ? Number(process.argv[seedArg + 1])
    : 20260531;

const pool = await filterHomeGalleryPool(homeGalleryPool);
const rows = buildHomeGalleryLayout(pool, seed);
const errors = validateHomeGalleryLayout(rows);
const counts = rows.map((r) => r.items.length);

console.log(`Seed ${seed}: ${rows.length} rows, counts [${counts.join(", ")}]`);
for (const [ri, row] of rows.entries()) {
  const tiers = row.items.map((it) => it.widthTier).join(" | ");
  console.log(`  row ${ri + 1} (${row.items.length}, ${row.justify}): ${tiers}`);
}

if (errors.length) {
  console.error("\nFAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("\nOK — layout passes spread checks.");

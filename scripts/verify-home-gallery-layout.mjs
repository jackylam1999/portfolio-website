#!/usr/bin/env node
/**
 * QA check for home gallery layout spread (same rules as validateHomeGalleryLayout).
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

const pool = filterHomeGalleryPool(homeGalleryPool);
const rows = buildHomeGalleryLayout(pool, seed);
const errors = validateHomeGalleryLayout(rows);
const counts = rows.map((r) => r.items.length);

console.log(`Seed ${seed}: ${rows.length} rows, counts [${counts.join(", ")}]`);
for (const [ri, row] of rows.entries()) {
  const cols = row.items
    .map((it) => `${it.colStart}-${it.colStart + it.colSpan - 1}`)
    .join(" | ");
  console.log(`  row ${ri + 1} (${row.items.length}): ${cols}`);
}

if (errors.length) {
  console.error("\nFAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("\nOK — layout passes spread checks.");

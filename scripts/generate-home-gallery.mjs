#!/usr/bin/env node
/**
 * Preview home gallery layout (same engine as runtime shuffle on refresh).
 *
 * Usage:
 *   npm run generate:home-gallery
 *   npm run generate:home-gallery -- --seed 42
 */
import { homeGalleryPool } from "../content/home-gallery-pool.ts";
import { buildHomeGalleryLayout } from "../lib/home-gallery-layout.ts";

function parseSeed() {
  const i = process.argv.indexOf("--seed");
  if (i !== -1 && process.argv[i + 1]) return Number(process.argv[i + 1]);
  return Math.floor(Math.random() * 0xffffffff);
}

const seed = parseSeed();
const rows = buildHomeGalleryLayout(homeGalleryPool, seed);
const counts = rows.map((r) => r.items.length);
const itemCount = counts.reduce((a, b) => a + b, 0);

console.log(`Seed: ${seed}`);
console.log(`Rows: ${rows.length}, items: ${itemCount}`);
console.log(`Counts per row: ${counts.join(",")}`);
for (const [ri, row] of rows.entries()) {
  const cols = row.items.map((it) => `${it.colStart}+${it.colSpan}`).join(" | ");
  console.log(`  row ${ri + 1} (${row.items.length}): ${cols}`);
}

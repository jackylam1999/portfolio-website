#!/usr/bin/env node
/**
 * Audit pool images and refresh content/home-gallery-scores.json.
 * Exits non-zero if filtered pool still contains line drawings.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { homeGalleryPool, isHomeGalleryLineDrawing } from "../content/home-gallery-pool.ts";
import { filterHomeGalleryPool } from "../lib/home-gallery-filter.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SCORES_OUT = path.join(ROOT, "content/home-gallery-scores.json");
const THRESHOLD = 0.48;

function scoreFor(base, file) {
  const rel = path.join("public", base.replace(/^\//, ""), file);
  const full = path.join(ROOT, rel);
  try {
    const out = execSync(
      `node scripts/classify-project-image.mjs --path "${full}"`,
      { encoding: "utf8", cwd: ROOT }
    );
    const m = out.match(/^\s*(0\.\d+)/m);
    return m ? Number(m[1]) : 0;
  } catch {
    return 0;
  }
}

const scores = {};
console.log("Scoring pool images…\n");
for (const item of homeGalleryPool) {
  const key = `${item.base.replace(/^\//, "")}/${item.file}`;
  const score = scoreFor(item.base, item.file);
  scores[key] = score;
  const blocked = isHomeGalleryLineDrawing(item.file) || score >= THRESHOLD;
  console.log(`${blocked ? "BLOCK" : "ok   "}  ${score.toFixed(3)}  ${key}`);
}

writeFileSync(SCORES_OUT, JSON.stringify(scores, null, 2) + "\n", "utf8");
console.log(`\nWrote ${SCORES_OUT}`);

const filtered = filterHomeGalleryPool(homeGalleryPool);
console.log(`Filtered pool: ${filtered.length} / ${homeGalleryPool.length} items`);

if (filtered.length < 8) {
  console.error("Filtered pool too small — adjust threshold or add photos.");
  process.exit(1);
}

console.log("\nOK");

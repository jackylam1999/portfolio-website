#!/usr/bin/env node
/**
 * Audit home gallery pool entries with classify-project-image scores.
 * Exits non-zero if any pool image scores >= threshold (line drawing).
 */
import { homeGalleryPool, isHomeGalleryLineDrawing } from "../content/home-gallery-pool.ts";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const THRESHOLD = 0.55;

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

let failed = 0;
console.log("Home gallery pool audit (threshold", THRESHOLD + "):\n");
for (const item of homeGalleryPool) {
  const blocked = isHomeGalleryLineDrawing(item.file);
  const score = scoreFor(item.base, item.file);
  const bad = blocked || score >= THRESHOLD;
  const flag = bad ? "BLOCK" : "ok   ";
  console.log(`${flag}  ${score.toFixed(3)}  ${item.base}/${item.file}`);
  if (bad) failed++;
}

if (failed) {
  console.error(`\n${failed} pool item(s) look like line drawings — remove them.`);
  process.exit(1);
}
console.log("\nAll pool items pass.");

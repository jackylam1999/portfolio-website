#!/usr/bin/env node
/**
 * Verifies that the desktop home page layout data (content/home-layout.ts)
 * matches content/home-readymag-spec.json — the measured source of truth for
 * the staggered composition (leftPct / widthPct / aspect / captionBelow per
 * image). Plain node (no tsx) so it runs under this sandbox; it extracts the
 * JSON-shaped array literal out of the .ts file with a regex rather than
 * compiling TypeScript.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const EPS = 0.05;

function loadSpec() {
  const raw = fs.readFileSync(
    path.join(root, "content/home-readymag-spec.json"),
    "utf8"
  );
  const spec = JSON.parse(raw);
  const flat = [];
  for (const row of spec.visualRows) {
    for (const img of row.images) {
      flat.push({
        rowIndex: row.index,
        slug: img.slug,
        leftPct: img.leftPct,
        widthPct: img.widthPct,
        aspect: img.aspect,
        captionBelow: img.captionBelow,
      });
    }
  }
  return flat;
}

function loadGenerated() {
  const tsPath = path.join(root, "content/home-layout.ts");
  const src = fs.readFileSync(tsPath, "utf8");
  const startMarker = "// HOME_LAYOUT_JSON_START";
  const endMarker = "// HOME_LAYOUT_JSON_END";
  const startIdx = src.indexOf(startMarker);
  const endIdx = src.indexOf(endMarker);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `Could not find HOME_LAYOUT_JSON_START/END markers in ${tsPath}`
    );
  }
  const between = src.slice(startIdx + startMarker.length, endIdx);
  const match = between.match(/=\s*(\[[\s\S]*\])\s*;?\s*$/);
  if (!match) {
    throw new Error(
      "Could not extract the HOME_LAYOUT_ROWS array literal — expected `export const HOME_LAYOUT_ROWS: ... = [...]` between the markers"
    );
  }
  let rows;
  try {
    rows = JSON.parse(match[1]);
  } catch (e) {
    throw new Error(
      `HOME_LAYOUT_ROWS block is not valid JSON (keep double-quoted keys, no trailing commas, no comments inside it): ${e.message}`
    );
  }
  const flat = [];
  rows.forEach((row, ri) => {
    row.forEach((slot) => {
      flat.push({
        rowIndex: ri + 1,
        slug: slot.slug,
        leftPct: slot.leftPct,
        widthPct: slot.widthPct,
        aspect: slot.aspect,
        captionBelow: slot.captionBelow,
        placeholder: slot.placeholder,
      });
    });
  });
  return flat;
}

function approxEq(a, b, eps = EPS) {
  return Math.abs(a - b) <= eps;
}

const spec = loadSpec();
const generated = loadGenerated();
const failures = [];

if (spec.length !== 9) {
  failures.push(`Expected 9 images in the spec, found ${spec.length}`);
}
if (generated.length !== spec.length) {
  failures.push(
    `Generated layout has ${generated.length} slots, spec has ${spec.length}`
  );
}

const n = Math.max(spec.length, generated.length);
for (let i = 0; i < n; i++) {
  const s = spec[i];
  const g = generated[i];
  if (!s || !g) {
    failures.push(`Slot ${i}: missing on ${!s ? "spec" : "generated"} side`);
    continue;
  }
  const label = `row ${s.rowIndex} slot ${i} (${s.slug})`;
  if (g.slug !== s.slug) {
    failures.push(`${label}: slug mismatch — spec=${s.slug} generated=${g.slug}`);
  }
  if (!approxEq(g.leftPct, s.leftPct)) {
    failures.push(`${label}: leftPct mismatch — spec=${s.leftPct} generated=${g.leftPct}`);
  }
  if (!approxEq(g.widthPct, s.widthPct)) {
    failures.push(`${label}: widthPct mismatch — spec=${s.widthPct} generated=${g.widthPct}`);
  }
  if (!approxEq(g.aspect, s.aspect, 0.01)) {
    failures.push(`${label}: aspect mismatch — spec=${s.aspect} generated=${g.aspect}`);
  }
  if (g.captionBelow !== s.captionBelow) {
    failures.push(
      `${label}: captionBelow mismatch — spec=${s.captionBelow} generated=${g.captionBelow}`
    );
  }
}

console.log(`Checked ${n} image slots against content/home-readymag-spec.json`);
for (let i = 0; i < n; i++) {
  const s = spec[i];
  const g = generated[i];
  if (!s || !g) continue;
  console.log(
    `  row ${s.rowIndex} ${s.slug.padEnd(28)} left ${g.leftPct}% width ${g.widthPct}% aspect ${g.aspect}${g.placeholder ? " [placeholder]" : ""}`
  );
}

if (failures.length) {
  console.error("\nFAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("\nOK — home-layout.ts matches home-readymag-spec.json for all images.");

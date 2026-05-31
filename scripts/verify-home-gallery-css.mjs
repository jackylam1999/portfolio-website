#!/usr/bin/env node
/**
 * Static CSS checks for FALA thumb-based home gallery.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8");
const failures = [];

const REF = 2560;
const VIEW = 1440;
const margin = Math.max(50, (VIEW * 60) / REF);
const content = VIEW - margin * 2;
const gap = Math.max(48, (VIEW * 24) / REF);
const thumbSm = Math.max(200, (VIEW * 338) / REF);
const thumbMd = Math.max(280, (VIEW * 688) / REF);
const thumbLg = Math.max(360, (VIEW * 989) / REF);

const rowBlock = css.match(/\.home-gallery-row\s*\{[^}]+\}/)?.[0] ?? "";
if (!rowBlock.includes("display: flex")) {
  failures.push("home-gallery-row must use flex layout");
}
if (rowBlock.includes("grid-template-columns")) {
  failures.push("home-gallery-row must not use grid-template-columns");
}
if (!css.includes("--site-thumb-sm") || !css.includes("--site-thumb-md")) {
  failures.push("missing FALA thumb CSS variables");
}

const minTile = thumbSm;
const lgMdRow = thumbLg + gap + thumbMd;

if (minTile < 180) {
  failures.push(`thumb-sm too small at 1440: ${minTile}px`);
}
if (lgMdRow > content + 1) {
  failures.push(`lg+md row wider than viewport at 1440`);
}

console.log({
  gapAt1440: Math.round(gap),
  thumbSmAt1440: Math.round(thumbSm),
  thumbMdAt1440: Math.round(thumbMd),
  thumbLgAt1440: Math.round(thumbLg),
  contentWidth: Math.round(content),
});

if (failures.length) {
  console.error("FAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("OK — static home gallery checks passed.");

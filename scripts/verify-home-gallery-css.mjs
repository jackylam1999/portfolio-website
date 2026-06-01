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
const thumbMd = Math.max(387, (VIEW * 688) / REF);
const thumbLg = Math.max(556, (VIEW * 989) / REF);
const imageAreaLeft = Math.max(480, (VIEW * 813) / REF);
const imageAreaWidth = Math.max(560, (VIEW * 1482) / REF);

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

if (!css.includes("padding-left: var(--site-image-area-left)")) {
  failures.push("desktop-home-gallery must align to site-image-area-left");
}
if (css.match(/\.home-gallery-tile__img[\s\S]{0,120}object-fit:\s*contain/)) {
  failures.push("home-gallery images must not use object-fit:contain (causes ant-sized portraits)");
}

const minTile = thumbMd;
const lgMdRow = thumbLg + gap + thumbMd;

if (minTile < 350) {
  failures.push(`thumb-md too small at 1440: ${minTile}px`);
}
if (thumbMd + gap + thumbMd > imageAreaWidth + 1) {
  failures.push(`md+md row wider than FALA image area at 1440`);
}

console.log({
  gapAt1440: Math.round(gap),
  thumbMdAt1440: Math.round(thumbMd),
  thumbLgAt1440: Math.round(thumbLg),
  imageAreaLeft: Math.round(imageAreaLeft),
  imageAreaWidth: Math.round(imageAreaWidth),
});

if (failures.length) {
  console.error("FAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("OK — static home gallery checks passed.");

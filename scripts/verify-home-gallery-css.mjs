#!/usr/bin/env node
/**
 * Static checks for home gallery CSS/markers (no browser).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const cssPath = path.join(root, "app/globals.css");
const mediaPath = path.join(root, "content/home-gallery-media.ts");
const tilePath = path.join(root, "components/home/HomeGalleryTile.tsx");

const css = fs.readFileSync(cssPath, "utf8");
const media = fs.readFileSync(mediaPath, "utf8");
const tile = fs.readFileSync(tilePath, "utf8");

const failures = [];

if (!css.includes("--home-gallery-gap: var(--site-home-col-gap)")) {
  failures.push("home-gallery-gap must use --site-home-col-gap");
}
if (css.includes("grid-subunit") && css.match(/home-gallery-gap.*grid-subunit/)) {
  failures.push("home-gallery-gap must not use grid-subunit");
}
if (media.includes("videoScaleX")) {
  failures.push("remove videoScaleX from home-gallery-media.ts");
}
if (tile.includes("videoScaleX") || tile.includes("580%")) {
  failures.push("remove width-based video scale hack from HomeGalleryTile");
}
if (!media.includes("contentWidthRatio")) {
  failures.push("contentWidthRatio override missing");
}
if (!tile.includes("contentWidthRatio")) {
  failures.push("HomeGalleryTile must use contentWidthRatio for aspect-ratio");
}

// 1440px viewport: gap = clamp(48, 1440*24/2560, 96) = 48px
const gapAt1440 = Math.max(48, Math.min(96, (1440 * 24) / 2560));
const padX = Math.max(16, Math.min(28, (1440 * 22) / 2560));
const inner = 1440 - 2 * padX;
const col = (inner - 11 * gapAt1440) / 12;
const span2 = col * 2 + gapAt1440;

console.log({
  gapAt1440: Math.round(gapAt1440),
  minColSpan2Px: Math.round(span2),
  singleColPx: Math.round(col),
});

if (gapAt1440 > 55) failures.push(`gap at 1440 too large: ${gapAt1440}`);
if (span2 < 80) failures.push(`2-col tile too narrow at 1440: ${span2}px`);

if (failures.length) {
  console.error("FAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log("OK — static home gallery checks passed.");

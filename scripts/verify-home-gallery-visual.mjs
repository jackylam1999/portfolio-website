#!/usr/bin/env node
/**
 * Visual QA for home gallery at 1440×900 (tile widths, image fill, screenshots).
 * Run after: npm run preview:prod (or serve on 3055)
 *   node scripts/verify-home-gallery-visual.mjs [baseUrl]
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../.verify-screenshots");
const baseUrl = process.argv[2] ?? "http://127.0.0.1:3055";
const label = baseUrl.includes("vercel") ? "live" : "local";

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForSelector(".home-gallery-row", { timeout: 30000 });
await page.waitForTimeout(1500);

const metrics = await page.evaluate(() => {
  const row = document.querySelector(".home-gallery-row");
  const gap = row ? getComputedStyle(row).columnGap : "";
  const tiles = [...document.querySelectorAll(".home-gallery-tile")];
  const tileData = tiles.map((t) => {
    const tr = t.getBoundingClientRect();
    const img = t.querySelector(".home-gallery-tile__img, .home-gallery-tile__video");
    const ir = img?.getBoundingClientRect();
    const tileW = Math.round(tr.width);
    const imgW = ir ? Math.round(ir.width) : 0;
    const fillRatio = tileW > 0 && imgW > 0 ? imgW / tileW : 1;
    return { tileW, imgW, fillRatio: Math.round(fillRatio * 100) / 100 };
  });
  const tileWidths = tileData.map((d) => d.tileW);
  const minW = tileWidths.length ? Math.min(...tileWidths) : 0;
  const maxW = tileWidths.length ? Math.max(...tileWidths) : 0;
  const minFill = tileData.length
    ? Math.min(...tileData.map((d) => d.fillRatio))
    : 1;
  const antTiles = tileData.filter((d) => d.fillRatio < 0.7 && d.tileW > 200);

  const video = document.querySelector(
    '.home-gallery-tile__video[src*="future%20report"], .home-gallery-tile__video[src*="future report"]'
  );
  let videoCrop = null;
  if (video) {
    const v = video;
    const media = v.closest(".home-gallery-tile__media");
    const vr = v.getBoundingClientRect();
    const mr = media?.getBoundingClientRect();
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(v, 0, 0);
    const { data, width: w, height: h } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let topBright = 0;
    let midBright = 0;
    let botBright = 0;
    const band = Math.floor(h / 5);
    for (let y = 0; y < h; y++) {
      let rowBright = 0;
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        rowBright += data[i] + data[i + 1] + data[i + 2];
      }
      if (y < band) topBright += rowBright;
      else if (y < h - band) botBright += rowBright;
      else midBright += rowBright;
    }
    videoCrop = {
      mediaW: mr?.width,
      mediaH: mr?.height,
      videoW: vr.width,
      videoH: vr.height,
      topBright,
      midBright,
      botBright,
      showsTopContent: topBright > 50000,
    };
  }
  return {
    gap,
    minTileWidth: minW,
    maxTileWidth: maxW,
    tileCount: tiles.length,
    minFillRatio: minFill,
    antTileCount: antTiles.length,
    tileData: tileData.slice(0, 12),
    videoCrop,
  };
});

await page.screenshot({
  path: path.join(outDir, `home-gallery-${label}-1440.png`),
  fullPage: false,
});

const videoTile = page.locator(".home-gallery-tile").filter({
  has: page.locator('video[src*="future"]'),
});
if ((await videoTile.count()) > 0) {
  await videoTile.first().screenshot({
    path: path.join(outDir, `eternal-voyage-video-tile-${label}.png`),
  });
}

console.log(JSON.stringify(metrics, null, 2));

const failures = [];
if (metrics.gap && parseFloat(metrics.gap) > 60) {
  failures.push(`column-gap too large: ${metrics.gap} (want ~48px at 1440)`);
}
if (metrics.minTileWidth > 0 && metrics.minTileWidth < 350) {
  failures.push(
    `min tile width ${metrics.minTileWidth}px (want >= 350 for lg/md tiers at 1440)`
  );
}
if (metrics.antTileCount > 0) {
  failures.push(
    `${metrics.antTileCount} tile(s) with image fill < 70% of tile width (ant-sized)`
  );
}
if (metrics.videoCrop && !metrics.videoCrop.showsTopContent) {
  failures.push("video appears to crop away top content (top band too dark)");
}

await browser.close();

if (failures.length) {
  console.error("\nFAILED:");
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\nOK — visual checks passed. Screenshots in .verify-screenshots/`);

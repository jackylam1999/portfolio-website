#!/usr/bin/env node
/**
 * Visual QA for home gallery at 1440×900 (column gap, tile widths, Eternal Voyage video).
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

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForSelector(".home-gallery-row", { timeout: 30000 });

const metrics = await page.evaluate(() => {
  const row = document.querySelector(".home-gallery-row");
  const gap = row ? getComputedStyle(row).columnGap : "";
  const tiles = [...document.querySelectorAll(".home-gallery-tile")];
  const tileWidths = tiles.map((t) => Math.round(t.getBoundingClientRect().width));
  const minW = tileWidths.length ? Math.min(...tileWidths) : 0;
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
  return { gap, minTileWidth: minW, tileCount: tiles.length, videoCrop };
});

await page.screenshot({
  path: path.join(outDir, "home-gallery-full.png"),
  fullPage: false,
});

const videoTile = page.locator(".home-gallery-tile").filter({
  has: page.locator('video[src*="future"]'),
});
if ((await videoTile.count()) > 0) {
  await videoTile.first().screenshot({
    path: path.join(outDir, "eternal-voyage-video-tile.png"),
  });
}

console.log(JSON.stringify(metrics, null, 2));

const failures = [];
if (metrics.gap && parseFloat(metrics.gap) > 60) {
  failures.push(`column-gap too large: ${metrics.gap} (want ~48px at 1440)`);
}
if (metrics.minTileWidth > 0 && metrics.minTileWidth < 180) {
  failures.push(`min tile width ${metrics.minTileWidth}px (want >= 180, FALA sm ~200+)`);
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
console.log("\nOK — visual checks passed. Screenshots in .verify-screenshots/");

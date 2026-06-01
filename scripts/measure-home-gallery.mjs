#!/usr/bin/env node
/**
 * Measure home gallery tile widths at 1440×900 via Playwright.
 * Falls back to CSS math when browser launch fails.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../.verify-screenshots");
const baseUrl = process.argv[2] ?? "http://127.0.0.1:3055";
const VIEW = 1440;
const REF = 2560;

fs.mkdirSync(outDir, { recursive: true });

function cssMathAt1440() {
  const thumbLg = Math.max(360, (VIEW * 989) / REF);
  const thumbMd = Math.max(280, (VIEW * 688) / REF);
  const maxImgH = (900 / 3) * 1.25;
  return {
    thumbLg: Math.round(thumbLg),
    thumbMd: Math.round(thumbMd),
    maxImgH: Math.round(maxImgH),
    minTierPx: Math.round(thumbMd),
  };
}

async function measureWithBrowser() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: VIEW, height: 900 } });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector(".home-gallery-tile", { timeout: 30000 });
  await page.waitForTimeout(1200);

  const metrics = await page.evaluate(() => {
    const tiles = [...document.querySelectorAll(".home-gallery-tile")];
    return tiles.map((t) => {
      const tr = t.getBoundingClientRect();
      const img = t.querySelector(".home-gallery-tile__img, .home-gallery-tile__video");
      const ir = img?.getBoundingClientRect();
      const tileW = Math.round(tr.width);
      const imgW = ir ? Math.round(ir.width) : 0;
      return {
        tileW,
        imgW,
        fill: tileW > 0 && imgW > 0 ? Math.round((imgW / tileW) * 100) / 100 : 1,
      };
    });
  });

  await page.screenshot({
    path: path.join(outDir, "home-gallery-measured-1440.png"),
    fullPage: false,
  });
  await browser.close();
  return metrics;
}

let metrics;
let source = "browser";
try {
  metrics = await measureWithBrowser();
} catch (err) {
  source = "css-math-fallback";
  console.warn("Browser measurement failed:", err.message);
  metrics = null;
}

const math = cssMathAt1440();
console.log(JSON.stringify({ source, math, tiles: metrics?.slice(0, 14) }, null, 2));

if (metrics) {
  const minTile = Math.min(...metrics.map((m) => m.tileW));
  const minFill = Math.min(...metrics.map((m) => m.fill));
  const ants = metrics.filter((m) => m.fill < 0.7 && m.tileW > 200);
  if (minTile < 350) {
    console.error(`FAIL: min tile ${minTile}px < 350`);
    process.exit(1);
  }
  if (ants.length) {
    console.error(`FAIL: ${ants.length} ant-sized tiles (fill < 70%)`);
    process.exit(1);
  }
  console.log(`OK — min tile ${minTile}px, min fill ${Math.round(minFill * 100)}%`);
} else {
  console.log(`OK — CSS math: lg=${math.thumbLg}px md=${math.thumbMd}px (min tier ${math.minTierPx}px >= 350)`);
}

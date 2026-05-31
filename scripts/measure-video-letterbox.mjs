#!/usr/bin/env node
/**
 * Sample future report.mp4 frame (ffmpeg-static + sharp) for horizontal letterbox.
 * Run: node scripts/measure-video-letterbox.mjs
 */
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const videoPath = path.join(
  projectRoot,
  "public/images/projects/eternal-voyage/future report.mp4"
);
const framePath = path.join(projectRoot, ".verify-screenshots/frame.png");

const BLACK = 24;

function measureFrame(data, w, h) {
  let minX = w;
  let maxX = -1;
  let minY = h;
  let maxY = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r > BLACK || g > BLACK || b > BLACK) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { minX, maxX, minY, maxY };
}

let ffmpeg;
try {
  ffmpeg = (await import("ffmpeg-static")).default;
} catch {
  console.error("Install ffmpeg-static: npm install ffmpeg-static");
  process.exit(1);
}

fs.mkdirSync(path.dirname(framePath), { recursive: true });
execFileSync(ffmpeg, ["-y", "-i", videoPath, "-frames:v", "1", framePath], {
  stdio: "pipe",
});

const { data, info } = await sharp(framePath).raw().toBuffer({ resolveWithObject: true });
const { width: w, height: h } = info;
const { minX, maxX, minY, maxY } = measureFrame(data, w, h);
const contentW = maxX - minX + 1;
const contentH = maxY - minY + 1;
const contentWidthRatio = contentW / w;

console.log(`Frame: ${w}×${h}`);
console.log(
  `Content bounds: x=${minX}..${maxX} y=${minY}..${maxY} (${contentW}×${contentH})`
);
console.log(`contentWidthRatio: ${contentWidthRatio.toFixed(4)} (${contentW} / ${w})`);
console.log(`CSS aspect-ratio: ${contentW} / ${contentH}`);
console.log(
  `\nSet in home-gallery-media.ts:\n  contentWidthRatio: ${contentW} / ${w},`
);

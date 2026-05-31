#!/usr/bin/env node
/**
 * Classify project images as line drawings (white-bg plans/diagrams) vs photos/renders.
 *
 * Detection (per raster frame, downsampled to max 512px):
 * 1. White ratio — share of pixels with R,G,B all >= 240 (typical plan backgrounds).
 * 2. Saturation — mean HSL saturation; line drawings skew near-grayscale (< ~0.12).
 * 3. Color spread — std-dev of RGB channel means; low spread = limited palette.
 * 4. Edge-on-white — Sobel edge density among near-white pixels (plans have dense linework).
 *
 * Score 0–1 (higher = more likely line drawing). Threshold default 0.55.
 * Videos (.mp4) and animated GIFs are never classified as line drawings.
 *
 * Usage:
 *   node scripts/classify-project-image.mjs
 *   node scripts/classify-project-image.mjs --path public/images/projects/foo/bar.webp
 *   node scripts/classify-project-image.mjs --json > report.json
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const IMAGES_ROOT = path.join(ROOT, "public/images/projects");

const SAMPLE_MAX = 512;
const WHITE_MIN = 240;
const THRESHOLD = 0.55;

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);
const SKIP_EXT = new Set([".mp4", ".mov", ".webm"]);

function parseArgs(argv) {
  const args = { json: false, path: null, threshold: THRESHOLD };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--json") args.json = true;
    else if (argv[i] === "--path" && argv[i + 1]) args.path = argv[++i];
    else if (argv[i] === "--threshold" && argv[i + 1]) {
      args.threshold = Number(argv[++i]);
    }
  }
  return args;
}

function collectFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) collectFiles(abs, out);
    else out.push(abs);
  }
  return out;
}

function relPublicPath(absPath) {
  return absPath.replace(path.join(ROOT, "public"), "").replace(/\\/g, "/");
}

function rgbToSaturation(r, g, b) {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  if (max === min) return 0;
  const l = (max + min) / 2;
  const d = max - min;
  return l > 0.5 ? d / (2 - max - min) : d / (max + min);
}

function sobelEdges(data, w, h) {
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * 3;
    gray[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
  }

  const edges = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const gx =
        -gray[idx - w - 1] +
        gray[idx - w + 1] -
        2 * gray[idx - 1] +
        2 * gray[idx + 1] -
        gray[idx + w - 1] +
        gray[idx + w + 1];
      const gy =
        -gray[idx - w - 1] -
        2 * gray[idx - w] -
        gray[idx - w + 1] +
        gray[idx + w - 1] +
        2 * gray[idx + w] +
        gray[idx + w + 1];
      edges[idx] = Math.hypot(gx, gy);
    }
  }
  return edges;
}

function analyzePixels(data, w, h) {
  const n = w * h;
  let whiteCount = 0;
  let satSum = 0;
  const channelMeans = [0, 0, 0];

  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    if (r >= WHITE_MIN && g >= WHITE_MIN && b >= WHITE_MIN) whiteCount++;
    satSum += rgbToSaturation(r, g, b);
    channelMeans[0] += r;
    channelMeans[1] += g;
    channelMeans[2] += b;
  }

  const whiteRatio = whiteCount / n;
  const meanSat = satSum / n;
  channelMeans.forEach((v, i) => {
    channelMeans[i] = v / n;
  });
  const spread = Math.sqrt(
    channelMeans.reduce((acc, m) => {
      const d = m - (channelMeans[0] + channelMeans[1] + channelMeans[2]) / 3;
      return acc + d * d;
    }, 0) / 3
  );

  const edges = sobelEdges(data, w, h);
  let whiteEdgeSum = 0;
  let whiteEdgeCount = 0;
  const edgeThreshold = 48;

  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const r = data[o];
    const g = data[o + 1];
    const b = data[o + 2];
    if (r >= WHITE_MIN && g >= WHITE_MIN && b >= WHITE_MIN) {
      whiteEdgeCount++;
      if (edges[i] >= edgeThreshold) whiteEdgeSum++;
    }
  }

  const edgeOnWhite = whiteEdgeCount > 0 ? whiteEdgeSum / whiteEdgeCount : 0;

  // Weighted score — tuned on portfolio plan vs render samples.
  const whiteScore = clamp01((whiteRatio - 0.45) / 0.35);
  const satScore = clamp01((0.18 - meanSat) / 0.18);
  const spreadScore = clamp01((28 - spread) / 28);
  const edgeScore = clamp01((edgeOnWhite - 0.015) / 0.08);

  const score =
    whiteScore * 0.4 + satScore * 0.25 + spreadScore * 0.15 + edgeScore * 0.2;

  const reasons = [];
  if (whiteRatio >= 0.55) reasons.push(`white ${(whiteRatio * 100).toFixed(0)}%`);
  if (meanSat <= 0.12) reasons.push(`low saturation ${meanSat.toFixed(3)}`);
  if (spread <= 18) reasons.push(`limited palette σ≈${spread.toFixed(1)}`);
  if (edgeOnWhite >= 0.03) reasons.push(`edge-on-white ${(edgeOnWhite * 100).toFixed(1)}%`);

  return {
    score: Number(score.toFixed(3)),
    metrics: {
      whiteRatio: Number(whiteRatio.toFixed(3)),
      meanSaturation: Number(meanSat.toFixed(3)),
      colorSpread: Number(spread.toFixed(2)),
      edgeOnWhite: Number(edgeOnWhite.toFixed(4)),
    },
    reason: reasons.length ? reasons.join("; ") : "colorful / low white background",
  };
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

async function analyzeRaster(absPath) {
  const { data, info } = await sharp(absPath)
    .rotate()
    .resize(SAMPLE_MAX, SAMPLE_MAX, { fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return analyzePixels(data, info.width, info.height);
}

async function classifyFile(absPath, threshold) {
  const rel = relPublicPath(absPath);
  const ext = path.extname(absPath).toLowerCase();

  if (SKIP_EXT.has(ext)) {
    return {
      path: rel,
      score: 0,
      isLineDrawing: false,
      reason: "video — skipped raster analysis",
    };
  }

  if (!RASTER_EXT.has(ext)) {
    return {
      path: rel,
      score: 0,
      isLineDrawing: false,
      reason: "unsupported extension — skipped",
    };
  }

  try {
    const meta = await sharp(absPath).metadata();
    if (meta.pages && meta.pages > 1) {
      return {
        path: rel,
        score: 0,
        isLineDrawing: false,
        reason: "animated GIF — treated as media",
      };
    }

    const result = await analyzeRaster(absPath);
    return {
      path: rel,
      ...result,
      isLineDrawing: result.score >= threshold,
    };
  } catch (err) {
    return {
      path: rel,
      score: 0,
      isLineDrawing: false,
      reason: `analysis failed: ${err.message}`,
    };
  }
}

async function main() {
  const args = parseArgs(process.argv);
  let files;

  if (args.path) {
    const abs = path.isAbsolute(args.path)
      ? args.path
      : path.join(ROOT, args.path.replace(/^\//, ""));
    files = [abs];
  } else {
    files = collectFiles(IMAGES_ROOT).filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return RASTER_EXT.has(ext) || SKIP_EXT.has(ext);
    });
    files.sort();
  }

  const results = [];
  for (const file of files) {
    results.push(await classifyFile(file, args.threshold));
  }

  if (args.json) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const lineDrawings = results.filter((r) => r.isLineDrawing);
  const photos = results.filter((r) => !r.isLineDrawing);

  console.log(`Classified ${results.length} files (threshold ${args.threshold})\n`);
  console.log(`Line drawings (${lineDrawings.length}):`);
  for (const r of lineDrawings) {
    console.log(`  ${r.score}\t${r.path}\t${r.reason}`);
  }
  console.log(`\nPhotos/renders (${photos.length}):`);
  for (const r of photos) {
    console.log(`  ${r.score}\t${r.path}\t${r.reason}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

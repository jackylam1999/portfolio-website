import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const SAMPLE_MAX = 512;
const WHITE_MIN = 240;
const DEFAULT_THRESHOLD = 0.58;

export type LineDrawingAnalysis = {
  score: number;
  isLineDrawing: boolean;
  reason: string;
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function rgbToSaturation(r: number, g: number, b: number): number {
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

function sobelEdges(data: Buffer, w: number, h: number): Float32Array {
  const gray = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const o = i * 3;
    gray[i] = 0.299 * data[o]! + 0.587 * data[o + 1]! + 0.114 * data[o + 2]!;
  }
  const edges = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      const gx =
        -gray[idx - w - 1]! +
        gray[idx - w + 1]! -
        2 * gray[idx - 1]! +
        2 * gray[idx + 1]! -
        gray[idx + w - 1]! +
        gray[idx + w + 1]!;
      const gy =
        -gray[idx - w - 1]! -
        2 * gray[idx - w]! -
        gray[idx - w + 1]! +
        gray[idx + w - 1]! +
        2 * gray[idx + w]! +
        gray[idx + w + 1]!;
      edges[idx] = Math.hypot(gx, gy);
    }
  }
  return edges;
}

function analyzePixels(
  data: Buffer,
  w: number,
  h: number,
  threshold: number
): LineDrawingAnalysis {
  const n = w * h;
  let whiteCount = 0;
  let satSum = 0;
  const channelMeans = [0, 0, 0];

  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const r = data[o]!;
    const g = data[o + 1]!;
    const b = data[o + 2]!;
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
      const d = m - (channelMeans[0]! + channelMeans[1]! + channelMeans[2]!) / 3;
      return acc + d * d;
    }, 0) / 3
  );

  const edges = sobelEdges(data, w, h);
  let whiteEdgeSum = 0;
  let whiteEdgeCount = 0;
  const edgeThreshold = 48;

  for (let i = 0; i < n; i++) {
    const o = i * 3;
    const r = data[o]!;
    const g = data[o + 1]!;
    const b = data[o + 2]!;
    if (r >= WHITE_MIN && g >= WHITE_MIN && b >= WHITE_MIN) {
      whiteEdgeCount++;
      if (edges[i]! >= edgeThreshold) whiteEdgeSum++;
    }
  }

  const edgeOnWhite = whiteEdgeCount > 0 ? whiteEdgeSum / whiteEdgeCount : 0;

  const whiteScore = clamp01((whiteRatio - 0.45) / 0.35);
  const satScore = clamp01((0.18 - meanSat) / 0.18);
  const spreadScore = clamp01((28 - spread) / 28);
  const edgeScore = clamp01((edgeOnWhite - 0.015) / 0.08);

  const score =
    whiteScore * 0.4 + satScore * 0.25 + spreadScore * 0.15 + edgeScore * 0.2;

  const reasons: string[] = [];
  if (whiteRatio >= 0.55) reasons.push(`white ${(whiteRatio * 100).toFixed(0)}%`);
  if (meanSat <= 0.12) reasons.push(`low saturation ${meanSat.toFixed(3)}`);
  if (spread <= 18) reasons.push(`limited palette σ≈${spread.toFixed(1)}`);
  if (edgeOnWhite >= 0.03) reasons.push(`edge-on-white ${(edgeOnWhite * 100).toFixed(1)}%`);

  const aspect = w / h;
  const stripLike = aspect > 2.2 && h < 420;
  const planLike =
    whiteRatio >= 0.55 && meanSat <= 0.08 && edgeOnWhite >= 0.12;
  const hazyRender =
    whiteRatio >= 0.8 && meanSat <= 0.02 && edgeOnWhite < 0.2 && spread <= 2;

  const isLineDrawing =
    stripLike ||
    (!hazyRender && (score >= threshold || planLike));

  return {
    score: Number(score.toFixed(3)),
    isLineDrawing,
    reason: reasons.length ? reasons.join("; ") : "photo/render",
  };
}

async function analyzeRaster(absPath: string, threshold: number): Promise<LineDrawingAnalysis> {
  const { data, info } = await sharp(absPath)
    .rotate()
    .resize(SAMPLE_MAX, SAMPLE_MAX, { fit: "inside", withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return analyzePixels(data, info.width, info.height, threshold);
}

export async function classifyPublicAsset(
  publicSrc: string,
  threshold = DEFAULT_THRESHOLD
): Promise<LineDrawingAnalysis> {
  const ext = path.extname(publicSrc).toLowerCase();
  if ([".mp4", ".mov", ".webm"].includes(ext)) {
    return { score: 0, isLineDrawing: false, reason: "video" };
  }

  const absPath = path.join(process.cwd(), "public", publicSrc.replace(/^\//, ""));
  if (!fs.existsSync(absPath)) {
    return { score: 0, isLineDrawing: false, reason: "missing file" };
  }

  try {
    const meta = await sharp(absPath).metadata();
    if (meta.pages && meta.pages > 1) {
      return { score: 0, isLineDrawing: false, reason: "animated gif" };
    }
    return analyzeRaster(absPath, threshold);
  } catch {
    return { score: 0, isLineDrawing: false, reason: "analysis failed" };
  }
}

export { DEFAULT_THRESHOLD as LINE_DRAWING_THRESHOLD };

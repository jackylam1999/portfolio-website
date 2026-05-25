#!/usr/bin/env node
/**
 * Pre-resize project JPEGs so Next.js image optimization is instant.
 * Writes WebP alongside originals; content files should point at .webp.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const QUALITY = 88;

async function loadProject(slug) {
  const mod = await import(
    pathToFileURL(path.join(ROOT, "content/projects", `${slug}.ts`)).href
  );
  return mod.default;
}

async function loadGrid(slug) {
  try {
    const mod = await import(
      pathToFileURL(path.join(ROOT, "content/grid", `${slug}.json`)).href
    );
    return mod.default;
  } catch {
    return { images: {} };
  }
}

function collectImages(project) {
  const out = [];
  if (project.homeThumbnail) {
    out.push({ sectionId: "home", img: project.homeThumbnail });
  }
  for (const s of project.sections) {
    for (const img of s.images ?? []) {
      out.push({ sectionId: s.id, img });
    }
  }
  return out;
}

function serveMaxWidth(sectionId, img, gridImages, siteConstants) {
  const measured = gridImages?.[sectionId];
  const w =
    img.displayWidthRef ??
    measured?.w ??
    (img.width === "narrow"
      ? siteConstants.widthNarrow
      : img.width === "full"
        ? siteConstants.widthFull
        : siteConstants.imageStandardWidth);
  return Math.ceil(w * 2);
}

async function optimizeOne(src, maxWidth, force = false) {
  if (!src.startsWith("/images/")) return null;
  const rel = src.replace(/^\//, "");
  const abs = path.join(PUBLIC, rel);
  const jpgSource = abs.replace(/\.webp$/i, ".jpg");
  const inputPath = fs.existsSync(jpgSource) ? jpgSource : abs;

  if (!fs.existsSync(inputPath)) {
    console.warn("  skip (missing):", src);
    return null;
  }

  const stem = inputPath.replace(/\.[^.]+$/i, "");
  const webpOut = `${stem}.webp`;
  const tmpOut = `${webpOut}.tmp`;
  if (fs.existsSync(webpOut) && !force) {
    console.log(`  skip (exists): ${path.basename(webpOut)}`);
    return webpOut.replace(PUBLIC, "").replace(/\\/g, "/");
  }

  const input = sharp(inputPath, { limitInputPixels: false });
  const meta = await input.metadata();
  const targetW = Math.min(maxWidth, meta.width ?? maxWidth);
  const quality = maxWidth <= 1440 ? 82 : QUALITY;

  await input
    .rotate()
    .resize({ width: targetW, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(tmpOut);

  fs.renameSync(tmpOut, webpOut);

  const before = fs.statSync(inputPath).size;
  const after = fs.statSync(webpOut).size;
  console.log(
    `  ${path.basename(src)} → ${path.basename(webpOut)} (${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB, w≤${targetW})`
  );

  return webpOut.replace(PUBLIC, "").replace(/\\/g, "/");
}

async function main() {
  const slug = process.argv[2] ?? "parliament-sports-complex";
  const force = process.argv.includes("--force");
  const project = await loadProject(slug);
  const grid = await loadGrid(slug);
  const site = await loadGrid("site");
  const images = collectImages(project);

  console.log(`→ Optimizing ${images.length} images for "${slug}"…`);

  const seen = new Set();
  for (const { sectionId, img } of images) {
    if (seen.has(img.src)) continue;
    seen.add(img.src);
    await optimizeOne(
      img.src,
      serveMaxWidth(sectionId, img, grid.images, site.constants),
      force
    );
  }

  console.log("→ Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

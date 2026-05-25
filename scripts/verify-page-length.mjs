#!/usr/bin/env node
/**
 * Smoke test: edit page JS chunk must include page-length controls.
 * Usage: PORT=3055 node scripts/verify-page-length.mjs
 */
const PORT = process.env.PORT || "3055";
const BASE = `http://127.0.0.1:${PORT}`;
const PATH = "/projects/parliament-sports-complex?edit=1";

async function main() {
  const htmlRes = await fetch(`${BASE}${PATH}`);
  if (!htmlRes.ok) {
    throw new Error(`Page ${htmlRes.status}`);
  }
  const html = await htmlRes.text();

  const chunkMatch = html.match(
    /\/_next\/static\/chunks\/app\/projects\/%5Bslug%5D\/(page-[a-f0-9]+\.js)/
  );
  if (!chunkMatch) {
    throw new Error("Project page chunk not found in HTML");
  }

  const chunkUrl = `/_next/static/chunks/app/projects/%5Bslug%5D/${chunkMatch[1]}`;
  const chunkRes = await fetch(`${BASE}${chunkUrl}`);
  if (!chunkRes.ok) {
    throw new Error(`Chunk ${chunkUrl} returned ${chunkRes.status}`);
  }
  const chunk = await chunkRes.text();
  if (chunk.length < 5000) {
    throw new Error(`Chunk too small (${chunk.length} bytes) — likely broken server`);
  }

  const markers = ["Page length", "adjustPageBottom", "Reduce page length"];
  const missing = markers.filter((m) => !chunk.includes(m));
  if (missing.length) {
    throw new Error(`Chunk missing: ${missing.join(", ")}`);
  }

  console.log(`OK: page-length controls in ${chunkMatch[1]} (${chunk.length} bytes)`);
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});

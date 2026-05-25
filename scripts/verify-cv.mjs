#!/usr/bin/env node
/** Verify CV page includes expected content on the live server. */
const PORT = process.env.PORT || "3055";
const BASE = `http://127.0.0.1:${PORT}`;

const MARKERS = [
  "Merit Award",
  "Shinkenchiku Residential Design Competition - New Summer Comfort, Japan",
  "Shinkenchiku 2025:05 magazine issue p.26",
  "Junior Designer",
  "Skidmore, Owings & Merrill (SOM), Melbourne",
];

async function main() {
  const res = await fetch(`${BASE}/cv`, { signal: AbortSignal.timeout(30_000) });
  if (!res.ok) throw new Error(`/cv returned ${res.status}`);
  const html = await res.text();
  const missing = MARKERS.filter((m) => !html.includes(m));
  if (missing.length) {
    throw new Error(`CV missing: ${missing.join(", ")}`);
  }
  console.log(`OK: CV page has ${MARKERS.length} expected markers (${html.length} bytes)`);
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});

#!/usr/bin/env node
/** Smoke-test key routes on the local dev server (default port 3055). */
const PORT = process.env.PORT || "3055";
const BASE = `http://127.0.0.1:${PORT}`;

const routes = [
  "/",
  "/?edit=1",
  "/cv",
  "/cv?edit=1",
  "/contact",
  "/contact?edit=1",
  "/projects/parliament-sports-complex",
  "/projects/parliament-sports-complex?edit=1",
];

const editRoutes = new Set([
  "/?edit=1",
  "/cv?edit=1",
  "/contact?edit=1",
  "/projects/parliament-sports-complex?edit=1",
]);

let failed = 0;

for (const path of routes) {
  const url = BASE + path;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
    const html = await res.text();
    const is404 = html.includes("could not be found") && html.includes("<title>404");
    const hasEditor = editRoutes.has(path)
      ? html.includes("editor-toolbar") || html.includes('data-editor","1"')
      : true;
    const ok = res.status === 200 && !is404 && html.length > 5000 && hasEditor;
    console.log(`${ok ? "✓" : "✗"} ${path} → ${res.status} (${html.length} bytes)${editRoutes.has(path) && !hasEditor ? " [no editor UI]" : ""}`);
    if (!ok) failed++;
  } catch (e) {
    console.log(`✗ ${path} → ${e.message}`);
    failed++;
  }
}

process.exit(failed ? 1 : 0);

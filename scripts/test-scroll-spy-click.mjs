#!/usr/bin/env node
/**
 * Browser test: click drawing menu vs scroll-spy at different viewport widths.
 * Run: node scripts/test-scroll-spy-click.mjs [port]
 */
import { chromium } from "playwright";

const PORT = process.argv[2] || process.env.PORT || "3056";
const URL = `http://127.0.0.1:${PORT}/projects/parliament-sports-complex`;

const WIDTHS = [2560, 1440, 1280, 1024, 900];

function activeSectionByTop(page) {
  return page.evaluate(() => {
    const refY = (() => {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:absolute;top:0;left:0;height:var(--site-content-top);width:0;visibility:hidden";
      document.body.appendChild(probe);
      const px = probe.getBoundingClientRect().height;
      probe.remove();
      return px;
    })();

    const sections = [...document.querySelectorAll("section.project-section[id]")];
    let candidate = sections[0]?.id ?? "";
    let bestTop = -Infinity;

    for (const section of sections) {
      const anchor =
        section.querySelector(".project-figure") ?? section;
      const top = anchor.getBoundingClientRect().top;
      if (top <= refY && top > bestTop) {
        bestTop = top;
        candidate = section.id;
      }
    }

    return { refY, candidate };
  });
}

function markerLabel(page) {
  return page.evaluate(() => {
    const marker = document.querySelector(".drawing-active-marker");
    const list = document.querySelector(".site-fixed-drawings ul");
    if (!marker || !list) return null;

    const markerRect = marker.getBoundingClientRect();
    const markerCenterY = markerRect.top + markerRect.height / 2;

    const items = [...list.querySelectorAll("li")];
    let closest = null;
    let closestDist = Infinity;

    for (const li of items) {
      const rect = li.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const dist = Math.abs(centerY - markerCenterY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = li.querySelector("a")?.textContent?.trim() ?? null;
      }
    }

    return closest;
  });
}

async function clickDrawing(page, label) {
  await page.locator(".site-fixed-drawings a", { hasText: label }).click();
  await page.waitForTimeout(900);
}

async function testWidth(browser, width) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 900 });

  const results = [];
  await page.goto(URL, { waitUntil: "networkidle" });

  const labels = await page.$$eval(".site-fixed-drawings a", (els) =>
    els.map((el) => el.textContent?.trim()).filter(Boolean)
  );

  for (const label of labels.slice(0, 8)) {
    await clickDrawing(page, label);
    const { refY, candidate } = await activeSectionByTop(page);
    const marker = await markerLabel(page);

    const clickedSection = await page.evaluate((lbl) => {
      const link = [...document.querySelectorAll(".site-fixed-drawings a")].find(
        (a) => a.textContent?.trim() === lbl
      );
      if (!link) return null;
      const href = link.getAttribute("href") ?? "";
      return href.replace("#", "");
    }, label);

    const figureTop = await page.evaluate((id) => {
      const section = document.getElementById(id);
      const anchor = section?.querySelector(".project-figure") ?? section;
      return anchor ? anchor.getBoundingClientRect().top : null;
    }, clickedSection);

    const ok = candidate === clickedSection && marker === label;
    results.push({
      width,
      label,
      ok,
      candidate,
      clickedSection,
      marker,
      figureTop,
      refY,
      delta: figureTop != null ? figureTop - refY : null,
    });
  }

  await page.close();
  return results;
}

const browser = await chromium.launch({ headless: true });
let failed = 0;

for (const width of WIDTHS) {
  console.log(`\n── viewport ${width}px`);
  const results = await testWidth(browser, width);
  for (const r of results) {
    const mark = r.ok ? "✓" : "✗";
    if (!r.ok) failed++;
    console.log(
      `${mark} click "${r.label}" → active=${r.candidate} marker="${r.marker}" figureTop-refY=${r.delta?.toFixed(1)}`
    );
  }
}

await browser.close();

if (failed) {
  console.error(`\n${failed} mismatch(es)`);
  process.exit(1);
}

console.log("\nAll click scroll-spy tests passed.");

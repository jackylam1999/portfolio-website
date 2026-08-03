# Portfolio Website — Project Notebook

**Jacky Chon Kei Lam architecture portfolio** — Read alongside `~/.cursor/skills/agent-notebook/NOTEBOOK.md`.

Reference: [Readymag original](https://readymag.website/u2007024744/5dsds0/) (faithful recreation target).

---

## Project path & stack

| Item | Value |
|------|--------|
| Repo | `/Users/jacky/Desktop/Cursor Server/Portfolio Website` |
| Stack | Next.js 14, TypeScript, Tailwind |
| Deploy target | Vercel (free tier) |
| Font | Georgia (`--font-site`, scales with viewport) |
| Accent | `#ed4d24` |
| Projects | ~8–10, ~15–20 images each, some videos |

---

## Environment & commands

| Item | Value |
|------|--------|
| **Preview port** | **3055** (use this consistently) |
| **Reliable start** | `npm run go` (stop → build → prod server) |
| **Stop servers** | `npm run stop` or `killall node` |
| **Build dir** | `NEXT_DIST_DIR=.next-dev` |
| **Editor URL** | `http://127.0.0.1:3055/projects/parliament-sports-complex?edit=1` |
| **Publish URL** | `http://127.0.0.1:3055/projects/parliament-sports-complex` |
| **Broken preview** | `killall node` → `npm run go` (user may need Terminal.app once) |

**Do not drift ports** without updating this notebook. Keep same port across updates to avoid 404 confusion.

Zombie node → EMFILE, white pages, stale chunks (400), "Failed to compile". Agent often cannot kill user PIDs from sandbox.

---

## Home gallery — ant-sized images (2026-06-01)

- **Scatter layout:** Random single-item rows + `space-between`/`flex-end` spread tiny images across empty viewport — not FALA. Fix: always **2-up rows** (`md+md`), `justify: flex-start`, align gallery to `--site-image-area-left`.
- **Video ant-size:** `aspect-ratio` on `.home-gallery-tile__media--video` shrinks tile width when `max-height` caps — visible video becomes ~160px wide. Fix: full tile width + `--video-content-ratio` horizontal crop on `<video>`.
- **Tier floors @ 1440:** `--site-thumb-md` min **387px**, `--site-thumb-lg` min **556px**. `lg+md` pairs overflow image area (834px) — use **md+md** only for pairs.
- **Plans in pool:** block `4WD in motion 2.png` (reads as line drawing on home).

## Home gallery — Eternal Voyage video (2026-06-01)

- **Wrong crop (bottom-only):** `videoScaleX: 5.8` + `width:580%` was based on ~17% content width; **measured** content is **804/1920 (41.9%)** (`node scripts/measure-video-letterbox.mjs` uses ffmpeg-static).
- **Fix:** `contentWidthRatio` → tile `aspect-ratio: 804/1080`; video `object-fit: cover; object-position: center` (no horizontal scale hack).
- **Column gap:** `--home-gallery-gap: var(--site-home-col-gap)` (~48px @ 1440); not grid-subunit (~84px → ~41px columns).

## Automated verification (run before claiming done)

```bash
npm run verify:all
# or individually:
npm run build
npm run test:routes
npm run test:scroll
npm run test:page-length
```

Live chunk check (UI features):
```bash
curl -s "http://127.0.0.1:3055/projects/parliament-sports-complex?edit=1" | grep -o 'page-[a-f0-9]*\.js'
curl -sI "http://127.0.0.1:3055/_next/static/chunks/app/projects/%5Bslug%5D/page-XXXX.js"  # must be 200
```

---

## Design spec (non-negotiable)

### Fixed chrome (do not scroll away)
- **Top-left**: "Jacky Chon Kei Lam", Instagram, Contact, CV — fixed.
- **Top-right**: Project index (year + name) — fixed; active project has **red strikethrough** extending ~10px past text each end.
- **Per-section text** (specs + description): fixed while scrolling; left-aligned; aligns with top-left menu column.
- **Right drawing menu**: fixed; triangle on **right** of label, pointing left toward text; ~5px gap text↔triangle.

### Cursor
- Default: **hollow black circle** (thick stroke).
- Hover clickable: **solid orange-red** (`#ed4d24`), same outer size as hollow.
- Hover: content **fades**.
- **Never show native pointer** over custom cursor (re-apply on route change; Chrome especially after home click).
- Edit mode (`?edit=1`): native cursor OK.

### Project page row alignment (desktop)
- Fixed description block: `--site-section-text-top` (spec top, y=242).
- Image column + drawing menu top: `--site-section-text-top` (same row as description).
- Scroll-spy activation still uses `--site-content-top` (purple line, y=312).
- First `.project-figure` in each column must have `margin-top: 0` (no grid `marginTop` on the page’s first image).

### Drawing menu / scroll spy
- Triangle **slides smoothly** between labels while scrolling (not jumpy).
- **Active section** = drawing whose **top edge** ≤ bottom **purple content line** (`--site-content-top`, y=312 ref).
- Click menu item → scroll so figure **top** aligns with that purple line (not midpoint).
- Menu must update live when images move in editor (ResizeObserver on figures).
- Known fix project: `detail-section-east` had marginTop offsets — triangle was wrong before figure-top fix.
- **Click vs manual scroll (small screens):** smooth `scrollTo` can finish with figure top still below the purple line (tighter section spacing + clamped `--site-content-top`). Scroll-spy then keeps the *previous* section active while manual scroll works. Fix: pin triangle to clicked section during programmatic scroll, then `scrollend` + snap correction (`scrollBy` delta) before clearing pending target.

### Modes (only two)
1. **Publish** — clean, no grid, no editor chrome.
2. **Editor** — `?edit=1` only (removed `?grid=1` preview-only mode).

### Editor (`?edit=1`)
- Toolbar: **bottom-left**, iOS glass, **below grid legend** (top toolbar shifted drawings — rejected).
- Grid toggle checkbox; snap to grid; corner drag = proportional scale; edge drag = width.
- Undo ⌘Z, redo ⌘⇧Z/⌘Y, save ⌘S; click blank space → deselect.
- **Page length** −/+ in toolbar ("Page length" row), steps ±149px ref.
- Grid labels: **A,B,C…** on vertical majors; **1,2,3…** on horizontal (for communicating with Jacky).

### Content rules
- **Do not change text** — exact copy from screenshots/Readymag.
- **Symbols exact** — `_` stays `_`.
- **Collaborator**: names comma-separated, same row ("Name1, Name2, Name3").
- **Inflection Journal Vol. 10**: own page, **not** in project index list.
- **Contact page**: only centered `chonkeilam.work@gmail.com`.
- **CV**: inline text page (no PDF), content left ~358px ref (not aligned with nav column).
- No Readymag watermark.

---

## Grid system (2560px reference canvas)

| Constant | Ref px | CSS var |
|----------|--------|---------|
| Image area left | 813 | `--site-image-area-left` |
| Image area width | 1482 | `--site-image-area-width` |
| Image area right | 2295 | — |
| Spec top (purple) | 242 | `--site-spec-top` |
| Content top (purple) | 312 | `--site-content-top` |
| Major module | 149 | `--site-grid-unit` |
| Subdivision | 74.5 | half of major |
| Default page bottom | 200 | `pageBottom` in grid JSON |

**Image area** = between left text gap and right drawing-bar reserve. Grid lines define placement — **images must not cross orange/red area boundaries**.

Alignment tiers: left / standard (drawing axis) / area / full width.

Content paths:
- `content/projects/` — project copy + image refs
- `content/grid/{slug}.json` — layout (saved from editor)
- `content/edits/{slug}.json` — text overrides
- `content/cv.json` — **CV page content** (read from disk; edit this file)
- `public/projects/{slug}/` — image files

---

## Architecture (current)

- **Publish** reads grid + edits from **disk at request time** via `loadProjectContent` → `ProjectGridProvider`.
- **Save API** writes JSON + `revalidatePath`; client `router.refresh()` after save → publish URL.
- Scroll spy: `.project-figure` top edge vs `--site-content-top`.
- Scripts: `scripts/go.sh`, `refresh-preview.sh`, `stop-all-servers.sh`, `verify-routes.mjs`, `verify-page-length.mjs`, `test-scroll-spy.mjs`.

---

## Lessons learned (this project)

### Alignment & grid
- Set up **logical grid first** (margins → image area → subdivisions), then place images to match screenshots.
- Double subdivisions + horizontal lines needed for fine control.
- Floor plans were repeatedly wrong scale — always cross-check against original screenshot ratios.
- "Orange/green lines too close" → re-derive from pink (text-image gap) + red (drawing bar margin).

### Editor & save
- Save must update publish immediately (disk read, not static import).
- Preview after save = same as publish URL (`?edit` removed); no editor chrome in publish.
- Drag vertical, snap, corner scale were explicit user requests — test all three.

### Visibility & servers
- Page-length floating control failed 3×; toolbar integration + `test:page-length` works.
- "White blank page" / "failed to compile" → stop zombies, clean cache, `npm run go`.
- User explicitly: **"cross check and test yourself until it works"** — do not return until `verify:all` passes.

### Navigation regressions (recurring)
- "Can't click into other pages" happened many times — always run `test:routes` after changes touching layout, cursor, or `_app`/`layout.tsx`.

### Images
- Optimize for speed (webp, sizes attr) while keeping quality — user expects near-instant load.
- User drops test images in `content/projects/` — match placement to screenshot via grid JSON.

---

## User quotes to remember

> "Design is already finalised — do not suggest changes to the layout or aesthetics."

> "ALWAYS CROSS CHECK WITH THE SCREENSHOT TO MAKE SURE EVERYTHING FROM CONTENT TO DESIGN AND LAYOUT ARE ALL EXACTLY THE SAME."

> "Alignment is a big key in this website… set up an invisible grid… visually should be highly accurate."

> "They are not just a decoration. They are being set up to follow."

> "I do not want to keep clicking the terminal… you need to do all the task automatically to debug everything."

> "I'm tired of the back and forth work. I do not want to touch it at all. cross check and test the website yourself until it works."

> "you need to do most of the job. i dont want to command back and forth so many times. automate everything yourself as much as possible."

---

## When adding a new project

1. Add content in `content/projects/`.
2. Add grid JSON in `content/grid/{slug}.json` (or use editor).
3. Images in `public/projects/{slug}/`.
4. Register grid import in `content/grid/registry.ts` if new slug.
5. Verify routes + visual alignment against screenshot.

---

## Lessons learned

### 2026-08-03 — Multi-image drawings + scroll-spy hit-test
- **Symptom:** Red drawing-menu arrow on wrong title; mobile treated corridor plan legends as separate slides at wrong size.
- **Root cause:** Pieces of one drawing were stacked as independent figures/slides; spy only watched first anchor / section top, and composition code sat uncommitted.
- **Fix:** `asComposition` / `compositionId` + `layoutComposition` → one `.project-composition` frame (desktop + one mobile slide). Spy primary = `elementsFromPoint` at `--site-content-top` across the image column; fallback = figure rect crossing.
- **Prevent:** Never leave composition/spy work unpushed. Corridor-like layouts need `asComposition: true` or shared `compositionId`. Test: `node scripts/test-drawing-composition.mjs`.

### 2026-08-03 — Cross-viewport vertical scale (left text scrollbar)
- **Symptom:** On non-Mac ratios, fixed left description showed a nested scrollbar; first-viewport images sat in awkward white bands.
- **Root cause:** Vertical tokens (`--site-content-top`, `--site-spec-top`, `--site-spec-gap`, …) scaled with `100vw` only and high floors; short/ultrawide-short viewports left too little height for pinned copy.
- **Fix:** Height-cap vertical tokens with `min(widthClamp, 100dvh × MacValue / 900)` so 1440×900 is unchanged while shorter screens tighten chrome. Hide aside scrollbar as safety. Verify: `node scripts/verify-viewport-scale.mjs`.
- **Prevent:** New vertical spacing must use the height-cap pattern; do not raise floors without checking 1280×720 text availability.

### 2026-08-03 — Font scales with viewport like Mac
- **Symptom:** Text looked too large on non-Mac ratios (left column scrollbar); Mac 1440×900 was correct.
- **Root cause:** `--font-site` used a loose `vw`/`rem` clamp that did not track height the same way as layout chrome.
- **Fix:** `--font-site = clamp(10px, min(vw×13.5/1440, vh×13.5/900), 17px)` — 13.5px at Mac, shrinks/grows with the tighter axis.
- **Prevent:** Keep all site type on `--font-site`; verify with `node scripts/verify-viewport-scale.mjs`.

### 2026-08-04 — Drawing overlays + Sabusawa composition
- **Symptom:** Missing gutter titles / Kingspan callouts; Sabusawa sizes wrong vs Readymag; right-hand consumption plan missing.
- **Root cause:** Readymag text/lines were separate layers (not in photo exports); craft was shown at 1257px (left column is ~727); consumption plan never exported as an asset.
- **Fix (v1):** Overlay system + multi-piece sabusawa — **regressed** (horizontal scrollbar + bad crop).
- **Fix (v2 / b66f950):** Single screenshot plate `sabusawa rice.webp` (1302×1760) inside image area; restore `overflow-x-clip`; `overflow-x:hidden` on html/body; overlays clipped inside figures (no negative x).
- **Prevent:** Never set image-column `overflow-x: visible` for gutter overlays — it creates page horizontal scroll. Prefer a single plate when multi-piece pull-ups fight the image-area width.

### 2026-08-03 — Missing drawing titles + Sabusawa order
- **Symptom:** Breathe/16 Units drawing menus missing titles; Sabusawa rice layout wrong vs Readymag.
- **Root cause:** Overview sections bundled multiple drawings under one pill; Sabusawa images ordered craft→tools→building with wrong offsets.
- **Fix:** Split into per-drawing sections (OCR from `PORTFOLIO WEBSITE/*.png`). Sabusawa: tools→craft→building, measured refs, `asComposition: true`. Diff aid: `.verify-screenshots/title-ocr/MISSING-TITLES.md`.
- **Prevent:** When adding stacked overview images, give each Readymag menu title its own section/`pillLabel`.

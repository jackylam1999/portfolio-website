# Portfolio Website — Jacky Chon Kei Lam

Next.js (App Router) + TypeScript + Tailwind CSS recreation of the Readymag portfolio at <https://readymag.website/u2007024744/5dsds0/>.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

### If `next dev` floods with `EMFILE: too many open files`

This is a macOS file-descriptor limit, not a project bug. Two ways to fix:

```bash
# Option 1: raise the FD limit for this shell only
ulimit -n 65536 && npm run dev

# Option 2: tell webpack/watchpack to use polling instead of fs.watch
WATCHPACK_POLLING=true npm run dev
```

If you don't need hot-reload, `npm run build && npm start` always works.

## Project layout

```text
app/
  layout.tsx          → global shell: cursor, fixed nav, fixed project index
  page.tsx            → home page (project thumbnail grid)
  cv/page.tsx         → CV page
  contact/page.tsx    → Contact page
  projects/[slug]/    → individual project pages (auto-generated from /content)
components/
  CustomCursor.tsx    → hollow black → solid red on hover
  FixedNav.tsx        → top-left nav
  FixedProjectIndex.tsx → top-middle/right project list
  ScrollSpyPills.tsx  → right-edge section nav with red triangle pointer
  ProjectPageLayout.tsx → per-project page template
  ProjectThumb.tsx    → home page thumbnail
content/
  site.ts             → name, email, links, Formspree endpoint
  cv.ts               → CV entries
  types.ts            → Project / Section types
  utils.ts            → shared helpers (e.g. underscore index line builder)
  projects/
    index.ts          → registry of all projects
    parliament-sports-complex.ts
    shack-in-the-paddyfield.ts
    16-units-above-a-city-brewery.ts
    breathe-on-the-land.ts
    stool-sm-1-39-03.ts
    eternal-voyage.ts
    symbiosis.ts
public/
  images/projects/<slug>/  → drop images here (per project folder)
```

## Adding a new project

1. Drop images into `public/images/projects/<new-slug>/`.
2. Create `content/projects/<new-slug>.ts` exporting a `Project` object.
3. Import it in `content/projects/index.ts` and add to the `projects` array.

That's it — the home grid, the fixed top-right index and `/projects/<new-slug>` all update automatically.

## Design rules locked in

- **Font:** Georgia, "Times New Roman", serif.
- **Cursor:** hollow black circle by default; solid red disc on hover over anything interactive; hovered target fades to ~45 % opacity.
- **No "Made with Readymag" watermark.**
- **Project index** lines use literal underscore separators, e.g. `2024_Parliament Sports Complex_Public_Melbourne`.

## Deploy

- Push to GitHub.
- Import the repo on Vercel.
- No environment variables required (Formspree endpoint is public).

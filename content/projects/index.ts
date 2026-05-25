// ─────────────────────────────────────────────────────────────────────────────
// Registry of all projects.
//
// Two exports:
//   • `projects` — the chronological list that appears in the fixed top-right
//     project index. Add a new project here AND to `allProjects` below.
//   • `allProjects` — every project page that has a route, including items
//     that should be accessible (and shown on the home grid) but hidden
//     from the top-right index (e.g. Inflection Journal Vol. 10).
// ─────────────────────────────────────────────────────────────────────────────
import type { Project } from "../types";

import parliamentSportsComplex from "./parliament-sports-complex";
import shackInThePaddyfield from "./shack-in-the-paddyfield";
import sixteenUnitsAboveACityBrewery from "./16-units-above-a-city-brewery";
import breatheOnTheLand from "./breathe-on-the-land";
import stool from "./stool-sm-1-39-03";
import eternalVoyage from "./eternal-voyage";
import symbiosis from "./symbiosis";
import inflectionJournalVol10 from "./inflection-journal-vol-10";

/** Order here = order shown in the fixed top-right index (top to bottom). */
export const projects: Project[] = [
  parliamentSportsComplex,
  shackInThePaddyfield,
  sixteenUnitsAboveACityBrewery,
  breatheOnTheLand,
  stool,
  eternalVoyage,
  symbiosis,
];

/** Every project that has a route — used for generateStaticParams + home grid. */
export const allProjects: Project[] = [...projects, inflectionJournalVol10];

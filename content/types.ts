// Shared content types for the portfolio.
// Adding a new project = create a new file in content/projects/ that
// exports a Project object, then import + push it into the list in
// content/projects/index.ts. The home page, project index, CV right
// column and individual project routes will all pick it up automatically.

export type ProjectCategory =
  | "Public"
  | "Residential"
  | "Furniture"
  | "Infrastructure"
  | "Publication";

export interface ProjectMeta {
  /** URL slug, e.g. "parliament-sports-complex" */
  slug: string;
  /** Display title, e.g. "Parliament Sports Complex" */
  title: string;
  /** Year, e.g. "2024" */
  year: string;
  /** Category as shown in the fixed top-right index */
  category: ProjectCategory;
  /** Location as shown in the fixed top-right index. May be empty for furniture. */
  location?: string;
  /**
   * Render the exact index line. Defaults to:
   *   `${year}_${title}_${category}${location ? "_" + location : ""}`
   * Override if a project uses different copy.
   */
  indexLineOverride?: string;
}

export interface ProjectSpecRow {
  label: string;
  value: string;
}

export interface ProjectImage {
  /** Path relative to /public, e.g. "/images/projects/parliament/01-hero.jpg" */
  src: string;
  /** Alt text */
  alt: string;
  /** Optional caption shown below or beside the image */
  caption?: string;
  /** Layout width for the column: "narrow" | "wide" | "full" */
  width?: "narrow" | "wide" | "full";
  /** Exact display width on the 2560px Readymag canvas (overrides width tier). */
  displayWidthRef?: number;
  /** Exact display height on the 2560px Readymag canvas. */
  displayHeightRef?: number;
  /** Horizontal offset from image-column origin (813px ref). Overrides center-axis calc. */
  marginLeftRef?: number;
  /** Natural pixel size — preserves drawing aspect ratio (no crop) */
  naturalWidth?: number;
  naturalHeight?: number;
}

export interface ProjectSection {
  /** ID used for scroll-spy + anchor links */
  id: string;
  /** Label shown in the right-side drawing list (e.g. "model", "site plan") */
  pillLabel: string;
  /** When true, insert a visual gap in the right-side list BEFORE this entry.
   *  Used to mirror Readymag's grouping of sections (plans / interiors / etc.). */
  groupBreak?: boolean;
  /** Optional paragraph text shown on the left of this section */
  text?: string[];
  /** Optional spec table shown on the left of this section (first section typically) */
  specs?: ProjectSpecRow[];
  /** Images stacked in the centre of this section */
  images?: ProjectImage[];
}

export interface Project extends ProjectMeta {
  sections: ProjectSection[];
  /** Image used on the home page thumbnail */
  homeThumbnail?: ProjectImage;
}

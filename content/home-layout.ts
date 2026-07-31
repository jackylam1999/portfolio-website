// Desktop home page composition — staggered image placement matching the
// original Readymag site (see content/home-readymag-spec.json, which is the
// measured source of truth). Percentages are of the CONTENT WIDTH (viewport
// minus --site-margin-x on each side), at the 1440px reference viewport.
//
// The block between the JSON_START/JSON_END markers below MUST stay valid
// JSON (double-quoted keys/strings, no comments, no trailing commas, no
// `as const`) — scripts/verify-home-composition.mjs extracts and parses it
// verbatim to cross-check every number against content/home-readymag-spec.json.
// If you edit a number here, update the spec file too (or vice versa).

export interface HomeLayoutSlot {
  /** Project slug — used to resolve title/href and (for non-placeholders) the image. */
  slug: string;
  /** Left edge of the image, as % of content width. */
  leftPct: number;
  /** Image width, as % of content width. */
  widthPct: number;
  /** width / height, used to size the box without cropping differently than the reference. */
  aspect: number;
  /** Whether the project title renders below this image. */
  captionBelow: boolean;
  /** True when there is no repo asset yet — render a neutral placeholder box at this position/size. */
  placeholder: boolean;
  /**
   * Which image to use for this slug when it appears more than once in the
   * composition (Parliament Sports Complex appears twice with two different
   * photos). Defaults to the project's `homeThumbnail`.
   */
  variant?: "home" | "side-street";
}

// HOME_LAYOUT_JSON_START
export const HOME_LAYOUT_ROWS: HomeLayoutSlot[][] = [
  [
    { "slug": "parliament-sports-complex", "leftPct": 24.8, "widthPct": 38.6, "aspect": 1.5, "captionBelow": true, "placeholder": false, "variant": "home" },
    { "slug": "parliament-sports-complex", "leftPct": 64.4, "widthPct": 34.0, "aspect": 0.8, "captionBelow": false, "placeholder": false, "variant": "side-street" }
  ],
  [
    { "slug": "symbiosis", "leftPct": 0.9, "widthPct": 67.4, "aspect": 2.0, "captionBelow": true, "placeholder": true }
  ],
  [
    { "slug": "inflection-journal-vol-10", "leftPct": 26.9, "widthPct": 34.9, "aspect": 1.22, "captionBelow": true, "placeholder": true },
    { "slug": "16-units-above-a-city-brewery", "leftPct": 62.7, "widthPct": 35.8, "aspect": 0.86, "captionBelow": true, "placeholder": false, "variant": "home" }
  ],
  [
    { "slug": "eternal-voyage", "leftPct": 0.9, "widthPct": 26.0, "aspect": 0.81, "captionBelow": true, "placeholder": false, "variant": "home" },
    { "slug": "shack-in-the-paddyfield", "leftPct": 27.8, "widthPct": 26.5, "aspect": 1.33, "captionBelow": true, "placeholder": false, "variant": "home" }
  ],
  [
    { "slug": "breathe-on-the-land", "leftPct": 33.0, "widthPct": 35.4, "aspect": 1.34, "captionBelow": true, "placeholder": false, "variant": "home" },
    { "slug": "stool-sm-1-39-03", "leftPct": 69.3, "widthPct": 29.6, "aspect": 0.67, "captionBelow": true, "placeholder": true }
  ]
];
// HOME_LAYOUT_JSON_END

/**
 * Curated landing gallery pool — photos, renders, GIFs, and video only.
 * Line drawings / plans are excluded by filename rules in isHomeGalleryLineDrawing().
 */

export type HomeGalleryPoolEntry = {
  slug: string;
  title: string;
  base: string;
  file: string;
  alt: string;
  w: number;
  h: number;
};

const LINE_DRAWING_RE =
  /(?:^|[\s_-])(?:plan|section|elevation|mapping|masterplan|exploded|legend|graph|table|key moves|edge conditions|tools|history|detail-section|site-plan|floor plan|overall section|unit section|construction details|net zero|flexibility1|infrastructure|water treatment|context mapping|adaptability)(?:[\s_.-]|$)/i;

const EXPLICIT_BLOCK = new Set([
  "model.webp",
  "water infrastrucutre.png",
  "context mapping.jpg",
  "elevation.png",
  "masterplan.png",
  "history 1.webp",
  "history.webp",
  "mapping.webp",
  "4WD on thte field 1.png",
  "4WD on thte field 2.png",
  "ranger station 1.png",
  "ranger station 2.png",
  "paddy field hut.png",
  "main facade.png",
  "sabusawa rice - traditional craft.webp",
]);

export function isHomeGalleryLineDrawing(file: string): boolean {
  if (EXPLICIT_BLOCK.has(file)) return true;
  return LINE_DRAWING_RE.test(file);
}

function entry(
  slug: string,
  title: string,
  base: string,
  file: string,
  alt: string,
  w: number,
  h: number
): HomeGalleryPoolEntry {
  return { slug, title, base, file, alt, w, h };
}

const RAW_POOL: HomeGalleryPoolEntry[] = [
  entry(
    "parliament-sports-complex",
    "Parliament Sports Complex",
    "/images/projects/parliament-sports-complex",
    "side-street.webp",
    "Side street",
    2000,
    2500
  ),
  entry(
    "parliament-sports-complex",
    "Parliament Sports Complex",
    "/images/projects/parliament-sports-complex",
    "sports-hall.webp",
    "Sports hall",
    2000,
    2500
  ),
  entry(
    "parliament-sports-complex",
    "Parliament Sports Complex",
    "/images/projects/parliament-sports-complex",
    "cricket-practice.webp",
    "Cricket practice",
    2000,
    2500
  ),
  entry(
    "parliament-sports-complex",
    "Parliament Sports Complex",
    "/images/projects/parliament-sports-complex",
    "basement-hall.webp",
    "Basement hall",
    2000,
    2500
  ),
  entry(
    "parliament-sports-complex",
    "Parliament Sports Complex",
    "/images/projects/parliament-sports-complex",
    "undercroft-transit.webp",
    "Undercroft transit",
    2000,
    2500
  ),
  entry(
    "16-units-above-a-city-brewery",
    "16 Units Above a City Brewery",
    "/images/projects/16-units-above-a-city-brewery",
    "summer morning.webp",
    "Summer morning",
    4000,
    2500
  ),
  entry(
    "16-units-above-a-city-brewery",
    "16 Units Above a City Brewery",
    "/images/projects/16-units-above-a-city-brewery",
    "beer garden.webp",
    "Beer garden",
    4000,
    2500
  ),
  entry(
    "16-units-above-a-city-brewery",
    "16 Units Above a City Brewery",
    "/images/projects/16-units-above-a-city-brewery",
    "facade.webp",
    "Facade",
    4000,
    2500
  ),
  entry(
    "shack-in-the-paddyfield",
    "Shack in the Paddyfield",
    "/images/projects/shack-in-the-paddyfield",
    "farm with the hut.webp",
    "Farm with the hut",
    1166,
    1244
  ),
  entry(
    "shack-in-the-paddyfield",
    "Shack in the Paddyfield",
    "/images/projects/shack-in-the-paddyfield",
    "hut in seasons.jpg",
    "Hut in seasons",
    4960,
    1562
  ),
  entry(
    "breathe-on-the-land",
    "Breathe on the Land",
    "/images/projects/breathe-on-the-land",
    "open air corridor.jpg",
    "Open air corridor",
    4000,
    3000
  ),
  entry(
    "breathe-on-the-land",
    "Breathe on the Land",
    "/images/projects/breathe-on-the-land",
    "childcare.png",
    "Childcare",
    4000,
    2700
  ),
  entry(
    "breathe-on-the-land",
    "Breathe on the Land",
    "/images/projects/breathe-on-the-land",
    "co working.png",
    "Co-working",
    4000,
    2700
  ),
  entry(
    "eternal-voyage",
    "Eternal Voyage",
    "/images/projects/eternal-voyage",
    "4WD in motion 2.png",
    "4WD in motion",
    2076,
    2768
  ),
  entry(
    "eternal-voyage",
    "Eternal Voyage",
    "/images/projects/eternal-voyage",
    "4WD in motion 1.gif",
    "4WD in motion",
    516,
    688
  ),
  entry(
    "eternal-voyage",
    "Eternal Voyage",
    "/images/projects/eternal-voyage",
    "dam.gif",
    "Dam",
    553,
    737
  ),
  entry(
    "eternal-voyage",
    "Eternal Voyage",
    "/images/projects/eternal-voyage",
    "future report.mp4",
    "Future report",
    1920,
    1080
  ),
  entry(
    "eternal-voyage",
    "Eternal Voyage",
    "/images/projects/eternal-voyage",
    "station to wetland 1.gif",
    "Station to wetland",
    553,
    737
  ),
  entry(
    "eternal-voyage",
    "Eternal Voyage",
    "/images/projects/eternal-voyage",
    "station to wetland 2.gif",
    "Station to wetland",
    497,
    662
  ),
  entry(
    "eternal-voyage",
    "Eternal Voyage",
    "/images/projects/eternal-voyage",
    "sewage canal to pool 1.gif",
    "Sewage canal to pool",
    737,
    983
  ),
  entry(
    "eternal-voyage",
    "Eternal Voyage",
    "/images/projects/eternal-voyage",
    "sewage canal to pool 2.gif",
    "Sewage canal to pool",
    504,
    672
  ),
];

export const homeGalleryPool: HomeGalleryPoolEntry[] = RAW_POOL.filter(
  (item) => !isHomeGalleryLineDrawing(item.file)
);

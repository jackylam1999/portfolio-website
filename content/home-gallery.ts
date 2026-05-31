import type { ProjectImage } from "@/content/types";
import { projectAsset } from "@/lib/project-media";

export type HomeGalleryItem = {
  slug: string;
  title: string;
  image: ProjectImage;
  /** Columns occupied on the 4-column home grid (1 or 2). */
  colSpan: 1 | 2;
};

const p = "/images/projects/parliament-sports-complex";
const u = "/images/projects/16-units-above-a-city-brewery";
const s = "/images/projects/shack-in-the-paddyfield";
const b = "/images/projects/breathe-on-the-land";
const e = "/images/projects/eternal-voyage";

/**
 * Curated landing gallery — photos, renders, GIFs, and video only (no line drawings).
 * Order + colSpan define rows on the 4-column grid (top-aligned, consistent gutters).
 */
export const homeGalleryItems: HomeGalleryItem[] = [
  {
    slug: "parliament-sports-complex",
    title: "Parliament Sports Complex",
    colSpan: 2,
    image: projectAsset(p, "model.webp", "Parliament Sports Complex model", 6240, 4160),
  },
  {
    slug: "16-units-above-a-city-brewery",
    title: "16 Units Above a City Brewery",
    colSpan: 1,
    image: projectAsset(u, "summer morning.webp", "Summer morning", 4000, 2500),
  },
  {
    slug: "shack-in-the-paddyfield",
    title: "Shack in the Paddyfield",
    colSpan: 1,
    image: projectAsset(s, "farm with the hut.webp", "Farm with the hut", 1166, 1244),
  },
  {
    slug: "breathe-on-the-land",
    title: "Breathe on the Land",
    colSpan: 1,
    image: projectAsset(b, "open air corridor.jpg", "Open air corridor", 4000, 3000),
  },
  {
    slug: "eternal-voyage",
    title: "Eternal Voyage",
    colSpan: 2,
    image: projectAsset(e, "4WD on thte field 1.png", "4WD on the field", 4961, 7016),
  },
  {
    slug: "parliament-sports-complex",
    title: "Parliament Sports Complex",
    colSpan: 1,
    image: projectAsset(p, "side-street.webp", "Side street", 2000, 2500),
  },
  {
    slug: "16-units-above-a-city-brewery",
    title: "16 Units Above a City Brewery",
    colSpan: 1,
    image: projectAsset(u, "beer garden.webp", "Beer garden", 4000, 2500),
  },
  {
    slug: "eternal-voyage",
    title: "Eternal Voyage",
    colSpan: 1,
    image: projectAsset(e, "dam.gif", "Dam", 553, 737),
  },
  {
    slug: "breathe-on-the-land",
    title: "Breathe on the Land",
    colSpan: 1,
    image: projectAsset(b, "childcare.png", "Childcare", 4000, 2700),
  },
  {
    slug: "parliament-sports-complex",
    title: "Parliament Sports Complex",
    colSpan: 1,
    image: projectAsset(p, "sports-hall.webp", "Sports hall", 2000, 2500),
  },
  {
    slug: "shack-in-the-paddyfield",
    title: "Shack in the Paddyfield",
    colSpan: 1,
    image: projectAsset(s, "paddy field hut.png", "Paddy field hut", 2000, 2500),
  },
  {
    slug: "eternal-voyage",
    title: "Eternal Voyage",
    colSpan: 2,
    image: projectAsset(e, "ranger station 1.png", "Ranger station", 4961, 7016),
  },
  {
    slug: "16-units-above-a-city-brewery",
    title: "16 Units Above a City Brewery",
    colSpan: 1,
    image: projectAsset(u, "facade.webp", "Facade", 4000, 2500),
  },
  {
    slug: "breathe-on-the-land",
    title: "Breathe on the Land",
    colSpan: 1,
    image: projectAsset(b, "co working.png", "Co-working", 4000, 2700),
  },
  {
    slug: "parliament-sports-complex",
    title: "Parliament Sports Complex",
    colSpan: 1,
    image: projectAsset(p, "cricket-practice.webp", "Cricket practice", 2000, 2500),
  },
  {
    slug: "shack-in-the-paddyfield",
    title: "Shack in the Paddyfield",
    colSpan: 2,
    image: projectAsset(s, "hut in seasons.jpg", "Hut in seasons", 4960, 1562),
  },
  {
    slug: "eternal-voyage",
    title: "Eternal Voyage",
    colSpan: 1,
    image: projectAsset(e, "future report.mp4", "Future report", 1920, 1080),
  },
  {
    slug: "breathe-on-the-land",
    title: "Breathe on the Land",
    colSpan: 1,
    image: projectAsset(b, "grassland dosmesticity.webp", "Grassland domesticity", 1016, 1224),
  },
];

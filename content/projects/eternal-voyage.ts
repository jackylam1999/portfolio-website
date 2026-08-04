import type { Project } from "../types";
import { projectAsset } from "@/lib/project-media";

const base = "/images/projects/eternal-voyage";
const a = (
  file: string,
  alt: string,
  w: number,
  h: number,
  width?: "narrow" | "wide" | "full",
  layout?: Parameters<typeof projectAsset>[6]
) => projectAsset(base, file, alt, w, h, width, layout);

/** Pull-up so img2 top aligns with img1 (displayW × naturalH / naturalW). */
const hAt = (nw: number, nh: number, dw: number) =>
  Math.round((dw * nh) / nw);

const project: Project = {
  slug: "eternal-voyage",
  title: "Eternal Voyage",
  year: "2022",
  category: "Infrastructure",
  location: "Western Plains",
  homeThumbnail: a("sewage canal to pool 2.gif", "Sewage canal to pool 2", 504, 672),
  sections: [
    {
      id: "overview",
      pillLabel: "future report",
      specs: [
        { label: "Category", value: "Infrastructure" },
        { label: "Location", value: "Western Plains/AU" },
        { label: "Year", value: "2022" },
        { label: "Phase", value: "Future Report to Western Plains" },
        { label: "Collaborator", value: "Ying Lee\nJohn Chen" },
      ],
      text: [
        "Eternal Voyage is an 'anti-park' that challenges the conventional Western approach to public greenspaces. Rather than clearing the land to create a manicured park, this project harnesses the existing water infrastructure and grassland ecosystem of the Western Plains, weaving them into a new public realm. Adapting to the region's changing climate and water dynamics, it reveals the hidden systems sustaining this landscape, making them legible and accessible to visitors.",
        "By cataloguing the diverse water infrastructure - from dams and retention ponds to canals and treatment plants - this project repurposes these elements, integrating them into a cohesive network of pathways, gathering spaces, and ecological habitats. This 'anti-park' creates a new norm of public space that sees the local grassland and infrastructure as a playground to be explored and experienced, inviting visitors to intimately engage with various systems that have long shaped this dynamic landscape.",
      ],
      images: [
        a("future report.mp4", "Future report", 1920, 1080, undefined, {
          displayWidthRef: 1217,
          marginLeftRef: 132,
        }),
      ],
    },
    {
      id: "water-infrastructure",
      pillLabel: "water infrastructure",
      groupBreak: true,
      images: [
        // Screenshot band ≈1051 tall → w = 1051 × 1500/3074 ≈ 513 (not 935;
        // wider preferred widths shrink via viewport-fit and look smaller than WTP).
        a("water infrastrucutre.png", "Water infrastructure", 1500, 3074, undefined, {
          displayWidthRef: 513,
          marginLeftRef: 0,
        }),
      ],
    },
    {
      id: "transect-sections",
      pillLabel: "transect sections",
      images: [],
    },
    {
      id: "masterplan",
      pillLabel: "masterplan",
      images: [
        // Max width that fits --site-image-max-box-height (1043 × 4961/7016).
        a("masterplan.png", "Masterplan", 4961, 7016, undefined, {
          displayWidthRef: 738,
          marginLeftRef: 0,
        }),
      ],
    },
    {
      id: "dam",
      pillLabel: "dam",
      groupBreak: true,
      images: [
        a("dam.gif", "Dam", 553, 737, "narrow", {
          displayWidthRef: 442,
          marginLeftRef: 0,
        }),
      ],
    },
    {
      id: "pivot-irrigation-cycle",
      pillLabel: "pivot irrigation cycle",
      images: [],
    },
    {
      id: "4wd-on-the-field",
      pillLabel: "4WD on the field",
      // Screenshot: axonometric + site plan side-by-side (513+801 @ ml 543),
      // not two stacked full-width portraits.
      asComposition: true,
      images: [
        a("4WD on thte field 1.png", "4WD on the field 1", 4961, 7016, undefined, {
          displayWidthRef: 513,
          marginLeftRef: 0,
        }),
        a("4WD on thte field 2.png", "4WD on the field 2", 4961, 7016, undefined, {
          displayWidthRef: 801,
          marginLeftRef: 543,
          marginTopRef: -hAt(4961, 7016, 513),
        }),
      ],
    },
    {
      id: "4wd-in-motion",
      pillLabel: "4WD in motion",
      asComposition: true,
      images: [
        a("4WD in motion 1.gif", "4WD in motion 1", 516, 688, undefined, {
          displayWidthRef: 566,
          marginLeftRef: 0,
        }),
        a("4WD in motion 2.png", "4WD in motion 2", 2076, 2768, undefined, {
          displayWidthRef: 590,
          marginLeftRef: 605,
          marginTopRef: -hAt(516, 688, 566),
        }),
      ],
    },
    {
      id: "ranger-station",
      pillLabel: "ranger station",
      groupBreak: true,
      asComposition: true,
      images: [
        a("ranger station 1.png", "Ranger station 1", 4961, 7016, undefined, {
          displayWidthRef: 566,
          marginLeftRef: 0,
        }),
        a("ranger station 2.png", "Ranger station 2", 4961, 7016, undefined, {
          displayWidthRef: 594,
          marginLeftRef: 605,
          marginTopRef: -hAt(4961, 7016, 566),
        }),
      ],
    },
    {
      id: "station-to-wetland",
      pillLabel: "station to wetland",
      asComposition: true,
      images: [
        a("station to wetland 1.gif", "Station to wetland 1", 553, 737, undefined, {
          displayWidthRef: 520,
          marginLeftRef: 0,
        }),
        a("station to wetland 2.gif", "Station to wetland 2", 497, 662, undefined, {
          displayWidthRef: 665,
          marginLeftRef: 666,
          marginTopRef: -hAt(553, 737, 520),
        }),
      ],
    },
    {
      id: "water-treatment-plant",
      pillLabel: "water treatment plant",
      /** Size reference for Eternal Voyage pair plates (screenshot 561+585). */
      asComposition: true,
      images: [
        a("water treatment plant 1.png", "Water treatment plant 1", 4961, 7016, undefined, {
          displayWidthRef: 561,
          marginLeftRef: 0,
        }),
        a("water treatment plant 2.png", "Water treatment plant 2", 4961, 7016, undefined, {
          displayWidthRef: 585,
          marginLeftRef: 616,
          marginTopRef: -hAt(4961, 7016, 561),
        }),
      ],
    },
    {
      id: "sewage-canal-to-pool",
      pillLabel: "sewage canal to pool",
      // Not in screenshot band — mirror water-treatment pair geometry.
      asComposition: true,
      images: [
        a("sewage canal to pool 1.gif", "Sewage canal to pool 1", 737, 983, undefined, {
          displayWidthRef: 561,
          marginLeftRef: 0,
        }),
        a("sewage canal to pool 2.gif", "Sewage canal to pool 2", 504, 672, undefined, {
          displayWidthRef: 585,
          marginLeftRef: 616,
          marginTopRef: -hAt(737, 983, 561),
        }),
      ],
    },
  ],
};

export default project;

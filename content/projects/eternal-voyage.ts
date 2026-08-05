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

/**
 * Shared plate height from screenshot (dam / motion / ranger / WTP bands ≈776–778).
 * Pair pieces set displayHeightRef to this and use object-cover so left/right match.
 */
const PLATE_H = 778;

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
        // Screenshot collage is ~347×997 (earlier 1065 bbox included fixed-index ink).
        a("water-infrastructure-plate.webp", "Water infrastructure", 347, 997, undefined, {
          displayWidthRef: 347,
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
        a("masterplan.png", "Masterplan", 4961, 7016, undefined, {
          displayWidthRef: 1086,
          marginLeftRef: 0,
        }),
      ],
    },
    {
      id: "dam",
      pillLabel: "dam",
      groupBreak: true,
      images: [
        // Cropped to screenshot aspect so w=442 → h≈776 (same plate height as WTP).
        a("dam-plate.webp", "Dam", 420, 737, "narrow", {
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
      asComposition: true,
      images: [
        a("4WD on thte field 1.png", "4WD on the field 1", 4961, 7016, undefined, {
          displayWidthRef: 513,
          displayHeightRef: PLATE_H,
          marginLeftRef: 0,
        }),
        a("4WD on thte field 2.png", "4WD on the field 2", 4961, 7016, undefined, {
          displayWidthRef: 801,
          displayHeightRef: PLATE_H,
          marginLeftRef: 543,
          marginTopRef: -PLATE_H,
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
          displayHeightRef: PLATE_H,
          marginLeftRef: 0,
        }),
        a("4WD in motion 2.png", "4WD in motion 2", 2076, 2768, undefined, {
          displayWidthRef: 590,
          displayHeightRef: PLATE_H,
          marginLeftRef: 605,
          marginTopRef: -PLATE_H,
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
          displayHeightRef: PLATE_H,
          marginLeftRef: 0,
        }),
        a("ranger station 2.png", "Ranger station 2", 4961, 7016, undefined, {
          displayWidthRef: 594,
          displayHeightRef: PLATE_H,
          marginLeftRef: 605,
          marginTopRef: -PLATE_H,
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
          displayHeightRef: PLATE_H,
          marginLeftRef: 0,
        }),
        a("station to wetland 2.gif", "Station to wetland 2", 497, 662, undefined, {
          displayWidthRef: 665,
          displayHeightRef: PLATE_H,
          marginLeftRef: 666,
          marginTopRef: -PLATE_H,
        }),
      ],
    },
    {
      id: "water-treatment-plant",
      pillLabel: "water treatment plant",
      /** Size reference — screenshot plates 561+585 @ h≈778. */
      asComposition: true,
      images: [
        a("water treatment plant 1.png", "Water treatment plant 1", 4961, 7016, undefined, {
          displayWidthRef: 561,
          displayHeightRef: PLATE_H,
          marginLeftRef: 0,
        }),
        a("water treatment plant 2.png", "Water treatment plant 2", 4961, 7016, undefined, {
          displayWidthRef: 585,
          displayHeightRef: PLATE_H,
          marginLeftRef: 616,
          marginTopRef: -PLATE_H,
        }),
      ],
    },
    {
      id: "sewage-canal-to-pool",
      pillLabel: "sewage canal to pool",
      asComposition: true,
      images: [
        a("sewage canal to pool 1.gif", "Sewage canal to pool 1", 737, 983, undefined, {
          displayWidthRef: 561,
          displayHeightRef: PLATE_H,
          marginLeftRef: 0,
        }),
        a("sewage canal to pool 2.gif", "Sewage canal to pool 2", 504, 672, undefined, {
          displayWidthRef: 585,
          displayHeightRef: PLATE_H,
          marginLeftRef: 616,
          marginTopRef: -PLATE_H,
        }),
      ],
    },
  ],
};

export default project;

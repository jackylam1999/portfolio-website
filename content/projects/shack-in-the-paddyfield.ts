import type { DrawingOverlays, Project } from "../types";
import { projectAsset } from "@/lib/project-media";
import curatedOverlays from "./shack-overlays.json";

const base = "/images/projects/shack-in-the-paddyfield";
const a = (
  file: string,
  alt: string,
  w: number,
  h: number,
  layout?: Parameters<typeof projectAsset>[6]
) => projectAsset(base, file, alt, w, h, undefined, layout);

type CuratedFile = Record<
  string,
  { texts?: DrawingOverlays["texts"]; lines?: DrawingOverlays["lines"] }
>;

function curated(sectionId: string): DrawingOverlays | undefined {
  const block = (curatedOverlays as CuratedFile)[sectionId];
  if (!block?.texts?.length) return undefined;
  // Keep callouts inside the figure (no negative x) to avoid page horizontal scroll.
  const texts = block.texts.map((t) => ({
    ...t,
    xRef: Math.max(0, t.xRef),
  }));
  return { texts, lines: block.lines ?? [] };
}

const project: Project = {
  slug: "shack-in-the-paddyfield",
  title: "Shack in the Paddyfield",
  year: "2024",
  category: "Residential",
  location: "Urato Islands",
  homeThumbnail: a("paddy field hut.png", "Paddy field hut", 2000, 2500),
  sections: [
    {
      id: "overview",
      pillLabel: "paddy field hut",
      specs: [
        { label: "Category", value: "Residential" },
        { label: "Location", value: "Urato Island/JP" },
        { label: "Year", value: "2024" },
        { label: "Phase", value: "Competition Entry, Microhome Competition" },
        { label: "Collaborator", value: "Gerald Low\nLixu Zhang\nYufei Ye" },
      ],
      text: [
        "Japan has experienced significant urban migration over recent decades, leading to rural decline where 37% of residents are over 65 and 13.8% of homes stand vacant. To address these challenges, this project focuses on Urato Island in Shiogama, Miyagi—a tsunami-affected community under restoration. The initiative aims to revitalise the area through traditional rice farming (Sabusawa) under permaculture principles, emphasising sustainability and minimal intervention in the natural environment.",
        "The project implements modular micro-housing using Kingspan products to facilitate affordable rural transitions for young entrepreneurs. This housing solution seeks to provide immediate, comfortable living spaces while respecting traditional architectural elements and local building practices. Additionally, it promotes local food experiences from satoyama as an attraction while preserving traditional practices.",
        "This approach aligns with government initiatives to incentivise youth relocation to rural areas, addressing critical issues of depopulation and ageing demographics in Japanese countryside communities. The project serves as a prototype for sustainable rural revitalisation, combining traditional wisdom with modern solutions to create viable communities for the next generation.",
      ],
      images: [a("paddy field hut.png", "Paddy field hut", 2000, 2500)],
    },
    {
      id: "context-mapping",
      pillLabel: "context mapping",
      groupBreak: true,
      images: [
        a("context mapping.jpg", "Context mapping", 3323, 2918, {
          displayWidthRef: 993,
          marginLeftRef: 111,
        }),
      ],
    },
    {
      id: "sabusawa-rice",
      pillLabel: "sabusawa rice",
      /**
       * Single screenshot-faithful plate (tools + craft + building units +
       * consumption plan). Multi-piece composition caused overflow/crop bugs.
       */
      images: [
        a("sabusawa rice.webp", "Sabusawa rice", 1302, 1760, {
          displayWidthRef: 1302,
          marginLeftRef: 0,
        }),
      ],
    },
    {
      id: "farm-with-the-hut",
      pillLabel: "farm with the hut",
      images: [a("farm with the hut.webp", "Farm with the hut", 1166, 1244)],
    },
    {
      id: "elevation",
      pillLabel: "elevation",
      groupBreak: true,
      images: [
        a("elevation.png", "Elevation", 1875, 1875, {
          displayWidthRef: 1170,
          marginLeftRef: 188,
        }),
      ],
    },
    {
      id: "floor-plan",
      pillLabel: "floor plan",
      overlays: curated("floor-plan"),
      images: [a("floor plan.jpg", "Floor plan", 3612, 2651)],
    },
    {
      id: "section",
      pillLabel: "section",
      overlays: curated("section"),
      images: [
        a("section.jpg", "Section", 2481, 2047, { displayWidthRef: 1280 }),
      ],
    },
    {
      id: "hut-in-seasons",
      pillLabel: "hut in seasons",
      groupBreak: true,
      overlays: curated("hut-in-seasons"),
      images: [
        a("hut in seasons.jpg", "Hut in seasons", 4960, 1562, {
          displayWidthRef: 1482,
        }),
      ],
    },
    {
      id: "exploded",
      pillLabel: "exploded",
      overlays: curated("exploded"),
      images: [
        a("exploded.png", "Exploded", 2105, 2811, {
          displayWidthRef: 1277,
          marginLeftRef: 102,
        }),
      ],
    },
  ],
};

export default project;

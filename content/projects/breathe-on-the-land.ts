import type { Project } from "../types";
import { projectAsset } from "@/lib/project-media";

const base = "/images/projects/breathe-on-the-land";
const a = (
  file: string,
  alt: string,
  w: number,
  h: number,
  width?: "narrow" | "wide" | "full",
  layout?: Parameters<typeof projectAsset>[6]
) => projectAsset(base, file, alt, w, h, width, layout);

/** Image-area width on the 2560 ref canvas. */
const AREA = 1482;

/**
 * Layout measured from the Readymag Breathe page (design canvas 1024px →
 * image area 1482). Widths that overflow the area are clamped.
 */
const project: Project = {
  slug: "breathe-on-the-land",
  title: "Breathe on the Land",
  year: "2023",
  category: "Public",
  location: "Melbourne",
  homeThumbnail: a("open air corridor.jpg", "Breathe on the Land", 4000, 3000),
  sections: [
    {
      id: "overview",
      pillLabel: "main facade",
      specs: [
        { label: "Category", value: "Community Centre_Public" },
        { label: "Location", value: "Melbourne/AU" },
        { label: "Year", value: "2023" },
        {
          label: "Phase",
          value:
            "Winner, Living Building Challenge Design Competition 2023, AU\nSpecial Mention, AA Prize for Unbuilt Work 2025, AU",
        },
      ],
      text: [
        "The former City West Water administrative building in Sunshine North, Victoria, is a heritage structure awaiting transformation into a community centre for the LUMA residential development. This site embodies a common challenge in Melbourne's western suburbs: balancing redevelopment of industrial land, heritage preservation, ecological protection of Western Plains grasslands, and the pursuit of net-zero carbon through innovative retrofit strategies.",
        "The project sees 'grasslands' as the focal point to redefine the traditional notion of 'nature' and reimagine the relationship between humans and other souls on Country. It acts as a testing ground for addressing the Victorian government's underperforming Melbourne Strategic Assessment (MSA) grassland management programme, which 'destroy first, restore later' approach to offsetting grassland destruction from urban sprawl has been proven financially unsustainable and ineffective in the Strategic Audit.",
        "In response, this project proposes an alternative grassland management model. The approach aims to restore disappearing native grasslands while accommodating gentrification. This symbiotic model demonstrates that urban expansion and remnant grasslands are not mutually exclusive, but mutually reinforcing. It reimagines a new form of domesticity and establishes a new norm of living peacefully on grassland, in harmony with the diverse souls that inhabit it.",
      ],
      images: [
        // 1. Wide grassland facade — FIRST on Readymag (not after corridor).
        a("main facade.png", "Main facade", 4000, 1700, undefined, {
          displayWidthRef: 1410,
          marginLeftRef: 151,
        }),
        // 2. History diptych — alone, right-aligned (NOT paired with mapping).
        a("history.webp", "History", 1440, 825, undefined, {
          displayWidthRef: 695,
          marginLeftRef: AREA - 695,
        }),
        // 3. Site map — solo below history.
        a("mapping.webp", "Mapping", 1229, 1236, undefined, {
          displayWidthRef: 881,
          marginLeftRef: 29,
        }),
        // 4. Three axonometric key moves.
        a("key moves.webp", "Key moves", 2131, 557, undefined, {
          displayWidthRef: 1110,
          marginLeftRef: 320,
        }),
      ],
    },
    {
      id: "edge-conditions",
      pillLabel: "edge conditions",
      groupBreak: true,
      images: [
        a("edge conditions.webp", "Edge conditions", 2105, 605, undefined, {
          displayWidthRef: 1062,
          marginLeftRef: 391,
        }),
      ],
    },
    {
      id: "ground-floor-plan",
      pillLabel: "ground floor plan",
      images: [
        a("ground floor plan.webp", "Ground floor plan", 3180, 2386, "full", {
          displayWidthRef: AREA,
          marginLeftRef: 0,
        }),
      ],
    },
    {
      id: "first-floor-plan",
      pillLabel: "first floor plan",
      images: [
        a("first floor plan.webp", "First floor plan", 3207, 2341, "full", {
          displayWidthRef: AREA,
          marginLeftRef: 0,
        }),
      ],
    },
    {
      id: "open-air-corridor",
      pillLabel: "open air corridor",
      groupBreak: true,
      images: [
        a("open air corridor.jpg", "Open air corridor", 4000, 3000, undefined, {
          displayWidthRef: 1033,
          marginLeftRef: 621,
        }),
      ],
    },
    {
      id: "construction-details",
      pillLabel: "construction details",
      images: [
        a("construction details.webp", "Construction details", 912, 1223, undefined, {
          displayWidthRef: 792,
          marginLeftRef: 0,
        }),
      ],
    },
    {
      id: "corridor-floor-plan",
      pillLabel: "corridor floor plan",
      images: [
        // 2-up plans (fitted inside 1482).
        a("corridor floor plan 1.webp", "Corridor floor plan 1", 1032, 964, undefined, {
          displayWidthRef: 573,
          marginLeftRef: 113,
        }),
        a("corridor floor plan 2.webp", "Corridor floor plan 2", 982, 937, undefined, {
          displayWidthRef: 547,
          marginLeftRef: 821,
          // Pull beside plan 1 (573 * 964/1032 ≈ 535).
          marginTopRef: -535,
        }),
        a("corridor floor plan legend 1.webp", "Corridor floor plan legend 1", 304, 196, undefined, {
          displayWidthRef: 147,
          marginLeftRef: 640,
          marginTopRef: 40,
        }),
        a("corridor floor plan legend 2.webp", "Corridor floor plan legend 2", 276, 187, undefined, {
          displayWidthRef: 133,
          marginLeftRef: 1205,
          marginTopRef: -94,
        }),
      ],
    },
    {
      id: "co-working",
      pillLabel: "co-working",
      groupBreak: true,
      images: [
        a("co working.png", "Co-working", 4000, 2700, undefined, {
          displayWidthRef: 721,
          marginLeftRef: 20,
        }),
      ],
    },
    {
      id: "childcare",
      pillLabel: "childcare",
      images: [
        a("childcare.png", "Childcare", 4000, 2700, undefined, {
          displayWidthRef: 722,
          marginLeftRef: 22,
        }),
      ],
    },
    {
      id: "long-section",
      pillLabel: "long section",
      groupBreak: true,
      // Asset not in repo yet — placeholder box keeps scroll rhythm.
      images: [],
    },
    {
      id: "grassland-domesticity",
      pillLabel: "grassland domesticity",
      groupBreak: true,
      images: [
        a("grassland dosmesticity.webp", "Grassland domesticity", 1016, 1224, "narrow", {
          displayWidthRef: 796,
          marginLeftRef: 0,
        }),
      ],
    },
    {
      id: "build-on-the-land",
      pillLabel: "build on the land",
      images: [
        a("build on the land.webp", "Build on the land", 1188, 1251, undefined, {
          displayWidthRef: 817,
          marginLeftRef: 496,
        }),
      ],
    },
    {
      id: "net-zero-carbon",
      pillLabel: "net-zero carbon",
      images: [
        // Readymag 3-up: table | graph | legend (not stacked legend-first).
        a("net zero carbon - table.webp", "Net-zero carbon table", 635, 1166, undefined, {
          displayWidthRef: 381,
          marginLeftRef: 249,
        }),
        a("net zero carbon - graph.webp", "Net-zero carbon graph", 616, 1045, undefined, {
          displayWidthRef: 353,
          marginLeftRef: 709,
          marginTopRef: -569,
        }),
        a("net zero carbon - legend.webp", "Net-zero carbon legend", 633, 309, undefined, {
          displayWidthRef: 407,
          marginLeftRef: AREA - 407,
          marginTopRef: -573,
        }),
      ],
    },
    {
      id: "adaptability",
      pillLabel: "adaptability",
      images: [
        a("adaptability.webp", "Adaptability", 1773, 359, undefined, {
          displayWidthRef: 1381,
          marginLeftRef: 101,
        }),
        a("adaptability 2025.webp", "Adaptability 2025", 1650, 663, undefined, {
          displayWidthRef: 796,
          marginLeftRef: 428,
          marginTopRef: 40,
        }),
        a("adaptability 2050.webp", "Adaptability 2050", 1680, 683, undefined, {
          displayWidthRef: 810,
          marginLeftRef: 414,
          marginTopRef: 40,
        }),
      ],
    },
    {
      id: "flexibility",
      pillLabel: "flexibility",
      images: [
        a("flexibility1.png", "Flexibility 1", 2426, 1820, undefined, {
          displayWidthRef: 867,
          marginLeftRef: 407,
        }),
        a("flexibility2.png", "Flexibility 2", 4000, 2500, undefined, {
          displayWidthRef: 867,
          marginLeftRef: 407,
          marginTopRef: 40,
        }),
        a("flexibility3.png", "Flexibility 3", 4000, 2500, undefined, {
          displayWidthRef: 867,
          marginLeftRef: 407,
          marginTopRef: 40,
        }),
      ],
    },
  ],
};

export default project;

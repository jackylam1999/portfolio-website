import type { Project } from "../types";
import { projectAsset } from "@/lib/project-media";

const base = "/images/projects/16-units-above-a-city-brewery";
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
 * Layout measured from the Readymag 16 Units page at 1440px, then fitted
 * into the site image band (1482 ref) so sizes/alignment match the screenshot.
 */
const project: Project = {
  slug: "16-units-above-a-city-brewery",
  title: "16 Units Above a City Brewery",
  year: "2023",
  category: "Residential",
  location: "Melbourne",
  homeThumbnail: a(
    "summer morning.webp",
    "16 Units Above a City Brewery",
    944,
    1174
  ),
  sections: [
    {
      id: "overview",
      pillLabel: "summer morning",
      specs: [
        { label: "Category", value: "Residential" },
        { label: "Location", value: "Melbourne/AU" },
        { label: "Year", value: "2023" },
        {
          label: "Phase",
          value: "Merit Award, Shinkenchiku Competition:\nNew Summer Comfort, JP",
        },
        { label: "Collaborator", value: "Gerald Low\nEddie Guo" },
      ],
      text: [
        "Over the past decades, Melbourne's CBD has witnessed a significant surge in private residential development, souring density transforming housing into commodity rather than a place to live. Perception of comfort in the city has become stigmatised, maximising commercial yields while opting for a 5-degree window opening, overheated glass facade resulting in excessive use of air conditioning.",
        "The proposed development sees the about-to-demolished office tower above Melbourne's oldest licensed pub, as an opportunity for new testing ground of an alternative comfort for city living.",
        "Let's prefer a lack of quality—opting for a robust and open frame where beauty arises from inherent spatial flexibility and freedom of everyday life.",
        "Let's embrace the dynamism and grittiness of the summer, gatherings on the rooftop, beer taps passing through each balcony for a summer night delight.",
        "Let's build an architecture that reevaluate what occupies the forefront of architecture where furniture, curtain tracks, exhaust systems and pipework are seen not just as functional elements but also performative in its spatial characters.",
        "Perhaps it's all about a sense of tough subtlety, just like the season of summer. Tough in its uncompromising openness towards the delicacy and changing light and air throughout the days, subtle enough that it actively filters, softens and mediate with its surroundings, tolerating and anticipating changes. Let's embrace another kind of summer comfort.",
      ],
      images: [
        // 1–2. Facade + site plan 2-up (site pulled up beside facade).
        a("facade.webp", "Facade", 1036, 1182, undefined, {
          displayWidthRef: 705,
          marginLeftRef: 0,
        }),
        a("site plan.webp", "Site plan", 1119, 1068, undefined, {
          displayWidthRef: 678,
          marginLeftRef: 730,
          marginTopRef: -714,
        }),
        // 3. History diptych (single wide file).
        a("history 1.webp", "History", 1868, 663, undefined, {
          displayWidthRef: 1057,
          marginLeftRef: 271,
          marginTopRef: 604,
        }),
        // 4. Key moves / open frames.
        a("key moves.webp", "Key moves", 1869, 874, undefined, {
          displayWidthRef: 1058,
          marginLeftRef: 285,
          marginTopRef: 380,
        }),
        // 5. Summer morning interior.
        a("summer morning.webp", "Summer morning", 944, 1174, undefined, {
          displayWidthRef: 763,
          marginLeftRef: 460,
          marginTopRef: 300,
        }),
      ],
    },
    {
      id: "beer-garden",
      pillLabel: "beer garden",
      images: [
        a("beer garden.webp", "Beer garden", 939, 1175, undefined, {
          displayWidthRef: 763,
          marginLeftRef: 459,
        }),
      ],
    },
    {
      id: "overall-floor-plan",
      pillLabel: "overall floor plan",
      groupBreak: true,
      images: [
        a("overall floor plan.webp", "Overall floor plan", 1298, 1245, undefined, {
          displayWidthRef: 1158,
          marginLeftRef: 324,
        }),
      ],
    },
    {
      id: "overall-section",
      pillLabel: "overall section",
      images: [
        a("overall section.webp", "Overall section", 1188, 1242, undefined, {
          displayWidthRef: 1080,
          marginLeftRef: 348,
        }),
      ],
    },
    {
      id: "unit-floor-plan",
      pillLabel: "unit floor plan",
      groupBreak: true,
      images: [
        a("unit floor plan.webp", "Unit floor plan", 1637, 1125, undefined, {
          displayWidthRef: 1181,
          marginLeftRef: 263,
        }),
      ],
    },
    {
      id: "unit-section",
      pillLabel: "unit section",
      images: [
        a("unit section.webp", "Unit section", 1899, 679, undefined, {
          displayWidthRef: 1235,
          marginLeftRef: 236,
        }),
      ],
    },
  ],
};

export default project;

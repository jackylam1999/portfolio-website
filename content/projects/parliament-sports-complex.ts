import type { Project, ProjectImage } from "../types";

const base = "/images/projects/parliament-sports-complex";

function img(
  file: string,
  alt: string,
  naturalWidth: number,
  naturalHeight: number,
  width?: ProjectImage["width"],
  displayWidthRef?: number
): ProjectImage {
  const stem = file.replace(/\.(jpe?g|png|webp)$/i, "");
  return {
    src: `${base}/${stem}.webp`,
    alt,
    naturalWidth,
    naturalHeight,
    width,
    displayWidthRef,
  };
}

const project: Project = {
  slug: "parliament-sports-complex",
  title: "Parliament Sports Complex",
  year: "2024",
  category: "Public",
  location: "Melbourne",
  homeThumbnail: img("model", "Parliament Sports Complex model", 6240, 4160),
  sections: [
    {
      id: "overview",
      pillLabel: "model",
      specs: [
        { label: "Category", value: "Public" },
        { label: "Location", value: "Melbourne/AU" },
        { label: "Year", value: "2024" },
      ],
      text: [
        "Despite Melbourne being a sports-obsessed city, public sports facilities are few and far between. The spatial expansive nature of conventional sporting infrastructure stands in sharp contrast to Melbourne's compact urban form. This disparity makes affordable options inconvenient, while easily accessible venues often come with steep price tags, turning sports into a luxury for many.",
        "In response, this project transforms an abandoned government building and its neighbouring areas within the Spring Street government precinct into a sports complex, a plaza, and a transit shelter. Existing heritage is preserved and complemented by the addition of a new lightweight envelope, creating an identity rooted in the tension between new and old, openness and closure.",
        "This project not only addresses the absence of public sports facilities in the city of Melbourne but also establishes a new prominent landmark that revitalises the previously isolated government precinct, symbolising the inseparable influence of sport on Australian political and social life.",
      ],
      images: [img("model", "Model", 6240, 4160)],
    },
    {
      id: "site-plan",
      pillLabel: "site plan",
      groupBreak: true,
      images: [img("site-plan", "Site plan", 13962, 9149)],
    },
    {
      id: "floor-plan-2",
      pillLabel: "floor plan - 2",
      images: [img("floor-plan-2", "Floor plan level 2", 19853, 12392, "full")],
    },
    {
      id: "floor-plan-g",
      pillLabel: "floor plan - g",
      images: [img("floor-plan-g", "Floor plan ground", 14998, 10427, "full")],
    },
    {
      id: "floor-plan-b2",
      pillLabel: "floor plan - b2",
      images: [img("floor-plan-b2", "Floor plan basement 2", 7016, 4961)],
    },
    {
      id: "side-street",
      pillLabel: "side street",
      groupBreak: true,
      images: [img("side-street", "Side street", 2000, 2500, "narrow")],
    },
    {
      id: "basement-hall",
      pillLabel: "24/7 basement hall",
      images: [img("basement-hall", "24/7 basement hall", 2000, 2500, "narrow")],
    },
    {
      id: "undercroft-transit",
      pillLabel: "undercroft transit",
      images: [img("undercroft-transit", "Undercroft transit", 2000, 2500, "narrow")],
    },
    {
      id: "cricket-practice",
      pillLabel: "cricket practice",
      images: [img("cricket-practice", "Cricket practice", 2000, 2500, "narrow")],
    },
    {
      id: "sports-hall",
      pillLabel: "sports hall",
      images: [img("sports-hall", "Sports hall", 2000, 2500, "narrow")],
    },
    {
      id: "elevation-west",
      pillLabel: "elevation - west",
      groupBreak: true,
      images: [img("elevation-west", "Elevation west", 19838, 8268, "full")],
    },
    {
      id: "section-west",
      pillLabel: "section - west",
      images: [img("section-west", "Section west", 13656, 9952)],
    },
    {
      id: "detail-section-west",
      pillLabel: "detail section - west",
      images: [img("detail-section-west", "Detail section west", 13775, 7941, "full")],
    },
    {
      id: "section-east",
      pillLabel: "section - east",
      images: [img("section-east", "Section east", 25030, 13625, "full")],
    },
    {
      id: "detail-section-east",
      pillLabel: "detail section - east",
      images: [img("detail-section-east", "Detail section east", 7452, 8867, "narrow")],
    },
  ],
};

export default project;

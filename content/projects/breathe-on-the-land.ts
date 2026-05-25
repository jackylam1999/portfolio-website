import type { Project } from "../types";

const project: Project = {
  slug: "breathe-on-the-land",
  title: "Breathe on the Land",
  year: "2023",
  category: "Public",
  location: "Melbourne",
  sections: [
    {
      id: "overview",
      pillLabel: "key moves",
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
      images: [],
    },
    { id: "edge-conditions", pillLabel: "edge conditions", groupBreak: true, images: [] },
    { id: "ground-floor-plan", pillLabel: "ground floor plan", images: [] },
    { id: "first-floor-plan", pillLabel: "first floor plan", images: [] },
    { id: "open-air-corridor", pillLabel: "open air corridor", groupBreak: true, images: [] },
    { id: "construction-details", pillLabel: "construction details", images: [] },
    { id: "corridor-floor-plan", pillLabel: "corridor floor plan", images: [] },
    { id: "co-working", pillLabel: "co-working", groupBreak: true, images: [] },
    { id: "childcare", pillLabel: "childcare", images: [] },
    { id: "long-section", pillLabel: "long section", groupBreak: true, images: [] },
    { id: "grassland-domesticity", pillLabel: "grassland domesticity", groupBreak: true, images: [] },
    { id: "build-on-the-land", pillLabel: "build on the land", images: [] },
    { id: "net-zero-carbon", pillLabel: "net-zero carbon", images: [] },
    { id: "adaptability", pillLabel: "adaptability", images: [] },
    { id: "flexibility", pillLabel: "flexibility", images: [] },
  ],
};

export default project;

import type { Project } from "../types";

const project: Project = {
  slug: "eternal-voyage",
  title: "Eternal Voyage",
  year: "2022",
  category: "Infrastructure",
  location: "Western Plains",
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
      images: [],
    },
    { id: "water-infrastructure", pillLabel: "water infrastructure", groupBreak: true, images: [] },
    { id: "transect-sections", pillLabel: "transect sections", images: [] },
    { id: "masterplan", pillLabel: "masterplan", images: [] },
    { id: "dam", pillLabel: "dam", groupBreak: true, images: [] },
    { id: "pivot-irrigation-cycle", pillLabel: "pivot irrigation cycle", images: [] },
    { id: "4wd-on-the-field", pillLabel: "4WD on the field", images: [] },
    { id: "4wd-in-motion", pillLabel: "4WD in motion", images: [] },
    { id: "ranger-station", pillLabel: "ranger station", groupBreak: true, images: [] },
    { id: "station-to-wetland", pillLabel: "station to wetland", images: [] },
    { id: "water-treatment-plant", pillLabel: "water treatment plant", images: [] },
    { id: "sewage-canal-to-pool", pillLabel: "sewage canal to pool", images: [] },
  ],
};

export default project;

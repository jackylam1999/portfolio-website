import type { Project } from "../types";

const project: Project = {
  slug: "stool-sm-1-39-03",
  title: "Stool SM-1.39.03",
  year: "2023",
  category: "Furniture",
  // No location for furniture; index line becomes "2023_Stool SM-1.39.03_Furniture".
  sections: [
    {
      id: "overview",
      pillLabel: "overview",
      specs: [
        { label: "Category", value: "Furniture" },
        { label: "Year", value: "2023" },
        { label: "Material", value: "Tasmanian Oak, 3D Printed TPU" },
        { label: "Collaborator", value: "Evan Jape" },
      ],
      text: [
        "Development of 3D printed fabric as programmable textiles. The stool transitions between densities and responds to load patterns of a seated individual.",
      ],
      images: [],
    },
  ],
};

export default project;

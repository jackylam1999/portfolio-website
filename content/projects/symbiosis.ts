import type { Project } from "../types";

const project: Project = {
  slug: "symbiosis",
  title: "Symbiosis",
  year: "2022",
  category: "Residential",
  location: "Melbourne",
  sections: [
    {
      id: "overview",
      pillLabel: "site elevation",
      specs: [
        { label: "Category", value: "Residential" },
        { label: "Location", value: "Melbourne/AU" },
        { label: "Year", value: "2022" },
        {
          label: "Phase",
          value: "Bronze Medal Commendation, RIBA President's Medals, UK",
        },
      ],
      text: [
        "Since the arrival of European Settlement, the western mode of habitation has been imposed on Aboriginal lands without concern for caring for country. However, western living and Indigenous values do not have to be mutually exclusive.",
        "This project draws from Indigenous teachings of equality between mankind and nature. It reawakens the value of traditional knowledge to offer comfortable, sustainable and well-ageing housing. With nature at the doorstep, the fleeting moments of it become part of everyday life.",
        "The concept of Symbiosis manifests in two typologies - apartment and townhouse. It provides homes for humans & nature and blurs their boundaries. The highly versatile unit configuration enables a tremendous resilience to circumstances.",
        "As such, the neighbourhood encapsulates symbiotic relationships across two dimensions: Space - between humans and nature; and Time - celebrating indigenous history in the context of post-colonialism and ongoing globalisation.",
        "With roots in Indigenous values and the flexibility to grow, the structure will enjoy a long and fruitful life.",
      ],
      images: [],
    },
    { id: "indigenous-values", pillLabel: "indigenous values", groupBreak: true, images: [] },
    { id: "concept-diagram", pillLabel: "concept diagram", images: [] },
    { id: "masterplan-rules", pillLabel: "masterplan rules", groupBreak: true, images: [] },
    { id: "masterplan", pillLabel: "masterplan", images: [] },
    { id: "massing-principles", pillLabel: "massing principles", images: [] },
    { id: "spatial-organisation", pillLabel: "spatial organisation", images: [] },
    { id: "unit-variety", pillLabel: "unit variety", images: [] },
    { id: "apartment-floor-plan", pillLabel: "apartment floor plan", groupBreak: true, images: [] },
    { id: "townhouse-floor-plan", pillLabel: "townhouse floor plan", images: [] },
    { id: "unit-in-decades", pillLabel: "unit in decades", groupBreak: true, images: [] },
    { id: "nature-in-decades", pillLabel: "nature in decades", images: [] },
    { id: "apartment-section", pillLabel: "apartment section", groupBreak: true, images: [] },
    { id: "domestic-room", pillLabel: "domestic room", images: [] },
    { id: "side-elevation", pillLabel: "side elevation", images: [] },
  ],
};

export default project;

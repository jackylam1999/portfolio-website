import type { Project } from "../types";

const project: Project = {
  slug: "16-units-above-a-city-brewery",
  title: "16 Units Above a City Brewery",
  year: "2023",
  category: "Residential",
  location: "Melbourne",
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
          value:
            "Competition Entry, Shinkenchiku Competition:\nNew Summer Comfort, JP",
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
      images: [],
    },
    { id: "beer-garden", pillLabel: "beer garden", images: [] },
    { id: "overall-floor-plan", pillLabel: "overall floor plan", groupBreak: true, images: [] },
    { id: "overall-section", pillLabel: "overall section", images: [] },
    { id: "unit-floor-plan", pillLabel: "unit floor plan", groupBreak: true, images: [] },
    { id: "unit-section", pillLabel: "unit section", images: [] },
  ],
};

export default project;

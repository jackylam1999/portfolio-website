import type { Project } from "../types";

const project: Project = {
  slug: "shack-in-the-paddyfield",
  title: "Shack in the Paddyfield",
  year: "2024",
  category: "Residential",
  location: "Urato Islands",
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
      images: [],
    },
    { id: "context-mapping", pillLabel: "context mapping", groupBreak: true, images: [] },
    { id: "sabusawa-rice", pillLabel: "sabusawa rice", images: [] },
    { id: "farm-with-the-hut", pillLabel: "farm with the hut", images: [] },
    { id: "elevation", pillLabel: "elevation", groupBreak: true, images: [] },
    { id: "floor-plan", pillLabel: "floor plan", images: [] },
    { id: "section", pillLabel: "section", images: [] },
    { id: "hut-in-seasons", pillLabel: "hut in seasons", groupBreak: true, images: [] },
    { id: "exploded", pillLabel: "exploded", images: [] },
  ],
};

export default project;

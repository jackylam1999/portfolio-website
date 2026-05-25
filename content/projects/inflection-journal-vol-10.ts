import type { Project } from "../types";

// Inflection Journal Vol. 10 has its own page but is intentionally NOT
// registered in content/projects/index.ts, so it does not appear in the
// fixed top-right project index. The page is reachable via the home
// page thumbnail or directly at /projects/inflection-journal-vol-10.
const project: Project = {
  slug: "inflection-journal-vol-10",
  title: "Inflection Journal Vol. 10",
  year: "2023",
  category: "Publication",
  // No appearance in the project index so location is left out.
  sections: [
    {
      id: "overview",
      pillLabel: "overview",
      specs: [
        { label: "Category", value: "Publication" },
        { label: "Year", value: "2023" },
        { label: "Publication", value: "Inflection Journal Vol. 10" },
      ],
      text: [
        "Featured article in Inflection Journal Vol. 10, Melbourne School of Design.",
      ],
      images: [],
    },
  ],
};

export default project;

import { allProjects } from "@/content/projects";
import type { ProjectImage } from "@/content/types";

export type HomeCarouselSlide = {
  slug: string;
  title: string;
  year: string;
  image: ProjectImage;
};

/** Order = landing page carousel sequence. Add slugs from `allProjects`. */
const carouselSlugs: string[] = [
  "parliament-sports-complex",
  "symbiosis",
  "16-units-above-a-city-brewery",
  "shack-in-the-paddyfield",
  "eternal-voyage",
  "breathe-on-the-land",
  "inflection-journal-vol-10",
  "stool-sm-1-39-03",
];

export function homeCarouselSlides(): HomeCarouselSlide[] {
  const bySlug = new Map(allProjects.map((p) => [p.slug, p]));

  return carouselSlugs.flatMap((slug) => {
    const project = bySlug.get(slug);
    const image = project?.homeThumbnail;
    if (!project || !image) return [];
    return [
      {
        slug,
        title: project.title,
        year: project.year,
        image,
      },
    ];
  });
}

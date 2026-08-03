import type { Project, ProjectImage } from "@/content/types";
import {
  groupSectionImages,
  layoutComposition,
  sectionIsComposition,
  type CompositionLayout,
} from "@/lib/drawing-composition";

export type MobileSlide = {
  sectionId: string;
  pillLabel: string;
  image: ProjectImage;
  /** When set, this slide is one frame that cycles through these images. */
  cycleImages?: ProjectImage[];
  cycleIntervalMs?: number;
  /** Spatial multi-image drawing — one slide, pieces keep relative layout. */
  compositionImages?: ProjectImage[];
  compositionLayout?: CompositionLayout;
  index: number;
};

/** Flat list of project drawings for the mobile swipe viewer. */
export function flattenProjectSlides(project: Project): MobileSlide[] {
  const slides: MobileSlide[] = [];
  let index = 0;

  for (const section of project.sections) {
    const images = section.images ?? [];
    if (!images.length) continue;

    if (section.imageCycleMs && images.length > 1) {
      slides.push({
        sectionId: section.id,
        pillLabel: section.pillLabel,
        image: images[0],
        cycleImages: images,
        cycleIntervalMs: section.imageCycleMs,
        index,
      });
      index += 1;
      continue;
    }

    if (sectionIsComposition(section)) {
      const layout = layoutComposition(
        project.slug,
        section.id,
        images
      );
      slides.push({
        sectionId: section.id,
        pillLabel: section.pillLabel,
        image: images[0],
        compositionImages: images,
        compositionLayout: layout,
        index,
      });
      index += 1;
      continue;
    }

    for (const group of groupSectionImages(section)) {
      if (group.type === "composition") {
        const layout = layoutComposition(
          project.slug,
          section.id,
          group.images
        );
        slides.push({
          sectionId: section.id,
          pillLabel: section.pillLabel,
          image: group.images[0],
          compositionImages: group.images,
          compositionLayout: layout,
          index,
        });
      } else {
        slides.push({
          sectionId: section.id,
          pillLabel: section.pillLabel,
          image: group.image,
          index,
        });
      }
      index += 1;
    }
  }

  return slides;
}

/** Zero-padded image count for chrome label, e.g. 08, 16. */
export function formatImageCount(count: number): string {
  return String(count).padStart(2, "0");
}

/** Specs + description for the Info overlay. */
export function projectInfoContent(project: Project): {
  specs: { label: string; value: string }[];
  paragraphs: string[];
} {
  const specs: { label: string; value: string }[] = [];
  const paragraphs: string[] = [];

  for (const section of project.sections) {
    if (!specs.length && section.specs?.length) {
      specs.push(...section.specs);
    }
    if (section.text?.length) {
      paragraphs.push(...section.text);
    }
  }

  if (!specs.length) {
    if (project.category) specs.push({ label: "Category", value: project.category });
    if (project.location) specs.push({ label: "Location", value: project.location });
    if (project.year) specs.push({ label: "Year", value: project.year });
  }

  return { specs, paragraphs };
}

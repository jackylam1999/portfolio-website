import type { Project, ProjectSection, ProjectSpecRow } from "@/content/types";
import parliamentEdits from "./parliament-sports-complex.json";

interface SectionTextEdit {
  text?: string[];
  specs?: ProjectSpecRow[];
}

export interface ProjectTextEdits {
  sections?: Record<string, SectionTextEdit>;
}

const PROJECT_TEXT_EDITS: Record<string, ProjectTextEdits> = {
  "parliament-sports-complex": parliamentEdits as ProjectTextEdits,
};

/** Merge persisted text edits onto a project's sections. */
export function applyTextEdits(
  project: Project,
  editsOverride?: ProjectTextEdits | null
): Project {
  const edits = editsOverride ?? PROJECT_TEXT_EDITS[project.slug];
  if (!edits?.sections) return project;

  const sections: ProjectSection[] = project.sections.map((section) => {
    const edit = edits.sections?.[section.id];
    if (!edit) return section;
    return {
      ...section,
      text: edit.text ?? section.text,
      specs: edit.specs ?? section.specs,
    };
  });

  return { ...project, sections };
}

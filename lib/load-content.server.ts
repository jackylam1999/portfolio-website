import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import type { ProjectGrid } from "@/content/grid/registry";
import type { ProjectSpecRow } from "@/content/types";
import type { CvSection } from "@/content/cv";

export type SectionTextEdit = {
  text?: string[];
  specs?: ProjectSpecRow[];
};

export type ProjectTextEdits = {
  sections?: Record<string, SectionTextEdit>;
};

export type LoadedProjectContent = {
  grid: ProjectGrid;
  textEdits: ProjectTextEdits;
};

function readJsonFile<T>(filePath: string): T | null {
  try {
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Read saved grid + text edits from disk (always fresh — not webpack-bundled). */
export const loadProjectContent = cache((slug: string): LoadedProjectContent => {
  const root = process.cwd();
  const grid =
    readJsonFile<ProjectGrid>(path.join(root, "content", "grid", `${slug}.json`)) ??
    {};
  const textEdits =
    readJsonFile<ProjectTextEdits>(
      path.join(root, "content", "edits", `${slug}.json`)
    ) ?? { sections: {} };

  return { grid, textEdits };
});

/** Read CV from content/cv.json (fresh on each request in dev/prod). */
export const loadCvContent = cache((): CvSection[] => {
  const root = process.cwd();
  const data = readJsonFile<{ sections: CvSection[] }>(
    path.join(root, "content", "cv.json")
  );
  return data?.sections ?? [];
});

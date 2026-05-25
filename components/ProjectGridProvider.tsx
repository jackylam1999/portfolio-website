"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ProjectGrid } from "@/content/grid/registry";
import { getBundledProjectGrid } from "@/content/grid/registry";

const ProjectGridContext = createContext<ProjectGrid | null>(null);

export function ProjectGridProvider({
  grid,
  children,
}: {
  grid: ProjectGrid;
  children: ReactNode;
}) {
  return (
    <ProjectGridContext.Provider value={grid}>{children}</ProjectGridContext.Provider>
  );
}

/** Saved grid from disk when wrapped in ProjectGridProvider; bundled fallback in edit/dev. */
export function useProjectGrid(slug: string): ProjectGrid {
  const saved = useContext(ProjectGridContext);
  if (saved) return saved;
  return getBundledProjectGrid(slug);
}

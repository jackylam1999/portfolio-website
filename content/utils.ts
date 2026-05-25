import type { Project, ProjectMeta } from "./types";

/**
 * Build the underscore-joined index line shown in the fixed top-right column.
 * Format follows the source exactly:
 *   `${year}_${title}_${category}_${location}`
 * with the trailing `_${location}` omitted when there is no location
 * (currently used by the Stool / Furniture entry).
 */
export function projectIndexLine(p: ProjectMeta): string {
  if (p.indexLineOverride) return p.indexLineOverride;
  const base = `${p.year}_${p.title}_${p.category}`;
  return p.location ? `${base}_${p.location}` : base;
}

/** Sort projects newest-first, preserving original order for ties. */
export function sortProjectsByYearDesc<T extends ProjectMeta>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ay = parseInt(a.year, 10);
    const by = parseInt(b.year, 10);
    return by - ay;
  });
}

/** Locate a project by slug. */
export function findProject(projects: Project[], slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

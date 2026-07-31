"use client";

import EditAwareLink from "@/components/EditAwareLink";
import { useProjectFilter } from "@/components/ProjectFilterContext";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { allProjects, projects } from "@/content/projects";
import { projectIndexLine, sortProjectsByYearDesc } from "@/content/utils";

export default function FixedProjectIndex() {
  const pathname = usePathname() || "";
  const { selectedCategory } = useProjectFilter();

  const currentSlug = pathname.startsWith("/projects/")
    ? pathname.replace("/projects/", "").split("/")[0]
    : null;

  const visibleProjects = useMemo(() => {
    if (!selectedCategory) return projects;
    return sortProjectsByYearDesc(
      allProjects.filter((p) => p.category === selectedCategory)
    );
  }, [selectedCategory]);

  return (
    <aside
      aria-label="Project index"
      className="site-fixed-index type-nav select-none tracking-tightish text-black"
    >
      <ul
        key={selectedCategory ?? "all"}
        className="site-fixed-index__list"
      >
        {visibleProjects.map((p) => {
          const active = p.slug === currentSlug;
          return (
            <li
              key={p.slug}
              className="overflow-visible whitespace-nowrap"
            >
              <EditAwareLink
                href={`/projects/${p.slug}`}
                className={
                  "cursor-interactive inline-block max-w-full align-bottom " +
                  (active
                    ? "project-index-active overflow-visible"
                    : "overflow-hidden text-ellipsis")
                }
              >
                {projectIndexLine(p)}
              </EditAwareLink>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

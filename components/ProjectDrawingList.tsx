"use client";

import { usePathname } from "next/navigation";
import { allProjects } from "@/content/projects";
import ScrollSpyPills from "./ScrollSpyPills";

/** Renders the fixed per-section drawing list on project pages only. */
export default function ProjectDrawingList() {
  const pathname = usePathname() || "";
  if (!pathname.startsWith("/projects/")) return null;

  const slug = pathname.replace("/projects/", "").split("/")[0];
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) return null;

  return <ScrollSpyPills sections={project.sections} />;
}

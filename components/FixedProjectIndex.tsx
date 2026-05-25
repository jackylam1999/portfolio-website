"use client";

import EditAwareLink from "@/components/EditAwareLink";
import { usePathname } from "next/navigation";
import { projects } from "@/content/projects";
import { projectIndexLine } from "@/content/utils";

export default function FixedProjectIndex() {
  const pathname = usePathname() || "";
  const currentSlug = pathname.startsWith("/projects/")
    ? pathname.replace("/projects/", "").split("/")[0]
    : null;

  return (
    <aside
      aria-label="Project index"
      className="site-fixed-index type-nav select-none tracking-tightish text-black"
    >
      <ul className="flex flex-col gap-px">
        {projects.map((p) => {
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

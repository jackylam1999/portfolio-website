"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { ProjectCategory } from "@/content/types";

export const PROJECT_FILTER_TYPES: ProjectCategory[] = [
  "Public",
  "Residential",
  "Furniture",
  "Infrastructure",
  "Publication",
];

type ProjectFilterContextValue = {
  selectedCategory: ProjectCategory | null;
  setSelectedCategory: (category: ProjectCategory | null) => void;
  toggleCategory: (category: ProjectCategory) => void;
};

const ProjectFilterContext = createContext<ProjectFilterContextValue | null>(
  null
);

export function ProjectFilterProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";
  const [selectedCategory, setSelectedCategory] =
    useState<ProjectCategory | null>(null);

  // Home always shows the original unfiltered project-list order.
  useEffect(() => {
    if (pathname === "/") {
      setSelectedCategory(null);
    }
  }, [pathname]);

  const toggleCategory = useCallback((category: ProjectCategory) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  }, []);

  const value = useMemo(
    () => ({ selectedCategory, setSelectedCategory, toggleCategory }),
    [selectedCategory, toggleCategory]
  );

  return (
    <ProjectFilterContext.Provider value={value}>
      {children}
    </ProjectFilterContext.Provider>
  );
}

export function useProjectFilter() {
  const ctx = useContext(ProjectFilterContext);
  if (!ctx) {
    throw new Error("useProjectFilter must be used within ProjectFilterProvider");
  }
  return ctx;
}

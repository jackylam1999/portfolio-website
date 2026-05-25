import { Suspense } from "react";
import { notFound } from "next/navigation";
import { allProjects } from "@/content/projects";
import { applyTextEdits } from "@/content/edits";
import ProjectPageLayout from "@/components/ProjectPageLayout";
import LayoutGridOverlay from "@/components/LayoutGridOverlay";
import { EditorProvider } from "@/components/editor/EditorProvider";
import EditorToolbar from "@/components/editor/EditorToolbar";
import { ProjectGridProvider } from "@/components/ProjectGridProvider";
import { loadProjectContent } from "@/lib/load-content.server";
import { CLEAR_EDITOR_SCRIPT, isEditMode, SET_EDITOR_SCRIPT } from "@/lib/edit-mode";

interface Params {
  params: { slug: string };
  searchParams: { edit?: string };
}

/** Required so ?edit=1 is read at request time. */
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Params) {
  const project = allProjects.find((p) => p.slug === params.slug);
  if (!project) return {};
  return {
    title: `${project.title} — Jacky Chon Kei Lam`,
  };
}
export default function ProjectPage({ params, searchParams }: Params) {
  const project = allProjects.find((p) => p.slug === params.slug);
  if (!project) return notFound();

  const { grid, textEdits } = loadProjectContent(params.slug);
  const merged = applyTextEdits(project, textEdits);
  const editOn = isEditMode(searchParams);

  if (!editOn) {
    return (
      <ProjectGridProvider grid={grid}>
        <script dangerouslySetInnerHTML={{ __html: CLEAR_EDITOR_SCRIPT }} />
        <ProjectPageLayout project={merged} />
      </ProjectGridProvider>
    );
  }

  return (
    <ProjectGridProvider grid={grid}>
      <script dangerouslySetInnerHTML={{ __html: SET_EDITOR_SCRIPT }} />
      <EditorProvider project={merged} enabled savedGrid={grid}>
        <LayoutGridOverlay enabled />
        <Suspense fallback={null}>
          <EditorToolbar />
        </Suspense>
        <ProjectPageLayout project={merged} />
      </EditorProvider>
    </ProjectGridProvider>
  );
}

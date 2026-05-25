"use client";

import Image from "next/image";
import type { Project, ProjectImage, ProjectSection } from "@/content/types";
import FixedSectionText from "@/components/FixedSectionText";
import MobileProjectPage from "@/components/mobile/MobileProjectPage";
import EditableFigure from "@/components/editor/EditableFigure";
import { useEditor } from "@/components/editor/EditorProvider";
import { useProjectGrid } from "@/components/ProjectGridProvider";
import {
  imageDisplayWidthCss,
  imageMarginLeftCss,
  imageMarginTopCss,
  imageSizesAttr,
  pageBottomPaddingCss,
  placeholderLayoutCss,
  sectionGapAfterCss,
} from "@/lib/image-layout";
import { getPageBottomRef, resolveImageLayout, type ProjectGrid } from "@/content/grid/registry";

interface Props {
  project: Project;
}

export default function ProjectPageLayout({ project }: Props) {
  let globalImageIndex = 0;
  const slug = project.slug;
  const grid = useProjectGrid(slug);
  const placeholder = placeholderLayoutCss(slug, grid);
  const editor = useEditor();
  const paddingBottom = editor.enabled
    ? pageBottomPaddingCss(editor.pageBottomRef)
    : pageBottomPaddingCss(getPageBottomRef(slug, grid));

  return (
    <>
      <div className="project-layout-desktop">
        <FixedSectionText sections={project.sections} />
        <div
          style={{
            paddingTop: "var(--site-content-top)",
            paddingLeft: "var(--site-margin-x)",
            paddingRight: "var(--site-right-reserve)",
          }}
        >
          <div className="flex flex-col">
            {project.sections.map((s, sectionIndex) => {
              const firstImageIndex = globalImageIndex;
              globalImageIndex += s.images?.length ?? 0;
              const gapAfter = sectionGapAfterCss(slug, s.id, grid);
              const isLast = sectionIndex === project.sections.length - 1;
              return (
                <div
                  key={s.id}
                  style={{
                    marginBottom: !isLast
                      ? gapAfter ?? "var(--site-section-gap)"
                      : undefined,
                  }}
                >
                  <Section
                    section={s}
                    slug={slug}
                    grid={grid}
                    firstImageIndex={firstImageIndex}
                    placeholder={placeholder}
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div
          className="project-page-bottom-spacer"
          style={{ height: paddingBottom }}
          aria-hidden
        />
      </div>

      <div className="project-layout-mobile">
        <MobileProjectPage project={project} />
      </div>
    </>
  );
}

function Section({
  section,
  slug,
  grid,
  firstImageIndex,
  placeholder,
}: {
  section: ProjectSection;
  slug: string;
  grid: ProjectGrid;
  firstImageIndex: number;
  placeholder: { width: string; marginLeft: string };
}) {
  const editor = useEditor();
  const editing = editor.enabled;

  return (
    <section
      id={section.id}
      className="project-section flex items-start"
      style={{ gap: "var(--site-left-gap)" }}
    >
      <div
        className="shrink-0"
        style={{ width: "var(--site-left-col)" }}
        aria-hidden
      />

      <div
        className="project-image-column flex min-w-0 flex-1 flex-col items-start overflow-x-clip"
        style={{
          maxWidth: "var(--site-image-area-width)",
        }}
      >
        {section.images?.length ? (
          section.images.map((img, i) =>
            editing ? (
              <EditableFigure
                key={i}
                slug={slug}
                img={img}
                sectionId={section.id}
                priority={firstImageIndex + i === 0}
              />
            ) : (
              <ProjectFigure
                key={i}
                slug={slug}
                grid={grid}
                img={img}
                sectionId={section.id}
                priority={firstImageIndex + i === 0}
              />
            )
          )
        ) : (
          <div
            className="type-body flex items-center justify-center border border-dashed border-neutral-300 text-neutral-400"
            style={{
              width: placeholder.width,
              marginLeft: placeholder.marginLeft,
              maxWidth: "100%",
              height: "calc(var(--site-image-standard-width) * 0.5625)",
              minHeight: "240px",
            }}
          >
            Images for &quot;{section.pillLabel}&quot; — add via content file
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectFigure({
  slug,
  grid,
  img,
  sectionId,
  priority,
}: {
  slug: string;
  grid: ProjectGrid;
  img: ProjectImage;
  sectionId: string;
  priority?: boolean;
}) {
  const w = img.naturalWidth ?? 1600;
  const h = img.naturalHeight ?? 1200;
  const preOptimized = img.src.endsWith(".webp");
  const layout = resolveImageLayout(slug, sectionId, img, grid);

  return (
    <figure
      className="project-figure m-0 flex shrink-0 flex-col items-start"
      style={{
        width: imageDisplayWidthCss(slug, sectionId, img, grid),
        marginLeft: imageMarginLeftCss(slug, sectionId, img, grid),
        marginTop: imageMarginTopCss(slug, sectionId, img, grid),
        maxWidth: "100%",
        aspectRatio: layout.aspectRatio,
      }}
    >
      <Image
        src={img.src}
        alt={img.alt}
        width={w}
        height={h}
        sizes={imageSizesAttr(slug, sectionId, img, grid)}
        quality={88}
        priority={priority}
        unoptimized={preOptimized}
        className="block h-full w-full object-contain object-left-top"
      />
      {img.caption ? (
        <figcaption className="type-caption text-black/70">{img.caption}</figcaption>
      ) : null}
    </figure>
  );
}

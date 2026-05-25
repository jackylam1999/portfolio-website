"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Project, ProjectImage, ProjectSection } from "@/content/types";
import MobileSectionNav from "@/components/mobile/MobileSectionNav";
import MobileSectionText from "@/components/mobile/MobileSectionText";
import MobileLayoutGrid from "@/components/mobile/MobileLayoutGrid";
import { projectIndexLine } from "@/content/utils";

interface Props {
  project: Project;
}

export default function MobileProjectPage({ project }: Props) {
  return (
    <article className="mobile-project">
      <Suspense fallback={null}>
        <MobileLayoutGrid />
      </Suspense>

      <header className="mobile-project-header">
        <Link href="/" className="mobile-project-header__back type-nav">
          Jacky Chon Kei Lam
        </Link>
        <h1 className="mobile-project-header__title type-body">{project.title}</h1>
        <p className="mobile-project-header__meta type-nav">{projectIndexLine(project)}</p>
      </header>

      <MobileSectionNav sections={project.sections} />

      <div className="mobile-project-body">
        {project.sections.map((section, index) => (
          <MobileSection
            key={section.id}
            section={section}
            isFirst={index === 0}
          />
        ))}
      </div>
    </article>
  );
}

function MobileSection({
  section,
  isFirst,
}: {
  section: ProjectSection;
  isFirst: boolean;
}) {
  const hasText = Boolean(section.specs?.length || section.text?.length);

  return (
    <section
      id={section.id}
      className={
        "mobile-project-section project-section" +
        (section.groupBreak && !isFirst ? " mobile-project-section--group-break" : "")
      }
    >
      <h2 className="mobile-section-label type-nav">{section.pillLabel}</h2>

      {hasText ? (
        <MobileSectionText specs={section.specs} text={section.text} />
      ) : null}

      {section.images?.length ? (
        <div className="mobile-section-figures">
          {section.images.map((img, i) => (
            <MobileFigure key={i} img={img} priority={isFirst && i === 0} />
          ))}
        </div>
      ) : (
        <div className="mobile-section-placeholder type-caption">
          Images for &quot;{section.pillLabel}&quot; — add via content file
        </div>
      )}
    </section>
  );
}

function MobileFigure({ img, priority }: { img: ProjectImage; priority?: boolean }) {
  const w = img.naturalWidth ?? 1600;
  const h = img.naturalHeight ?? 1200;
  const preOptimized = img.src.endsWith(".webp");

  return (
    <figure className="project-figure mobile-figure m-0">
      <Image
        src={img.src}
        alt={img.alt}
        width={w}
        height={h}
        sizes="100vw"
        quality={88}
        priority={priority}
        unoptimized={preOptimized}
        className="mobile-figure__img"
      />
      {img.caption ? (
        <figcaption className="type-caption mobile-figure__caption">{img.caption}</figcaption>
      ) : null}
    </figure>
  );
}

"use client";

import Image from "next/image";
import type { ProjectImage } from "@/content/types";
import type { ProjectGrid } from "@/content/grid/registry";
import { REF_WIDTH, imageMarginTopCss } from "@/lib/image-layout";
import { layoutComposition } from "@/lib/drawing-composition";
import { isPreOptimizedSrc, isVideoSrc } from "@/lib/project-media";

function refCss(ref: number): string {
  const floored = Math.round(Math.abs(ref) * 0.42);
  const lo = Math.min(floored, Math.abs(ref));
  const hi = Math.max(floored, Math.abs(ref));
  const sign = ref < 0 ? -1 : 1;
  if (sign < 0) {
    return `clamp(${-hi}px, calc(100vw * ${ref} / var(--ref-width)), ${-lo}px)`;
  }
  return `clamp(${lo}px, calc(100vw * ${ref} / var(--ref-width)), ${hi}px)`;
}

interface Props {
  slug: string;
  grid: ProjectGrid;
  sectionId: string;
  images: ProjectImage[];
  priority?: boolean;
  /** When false, omit scroll-spy click target (later stack in a multi-drawing section). */
  isAnchor?: boolean;
  /**
   * When this composition is stacked under another drawing in the same section,
   * apply the first piece's marginTop outside the frame (layout zeros piece 0 mt).
   */
  stackGap?: boolean;
}

/**
 * One drawing made of several placed images (2-up plans, legends, etc.).
 * Outer figure is the sole scroll-spy / mobile-frame hit box.
 */
export default function CompositionFigure({
  slug,
  grid,
  sectionId,
  images,
  priority,
  isAnchor = true,
  stackGap = false,
}: Props) {
  const layout = layoutComposition(slug, sectionId, images, grid);
  const lead = images[0];

  return (
    <figure
      className="project-figure project-composition relative m-0 shrink-0 overflow-visible"
      data-drawing-anchor={isAnchor ? sectionId : undefined}
      data-section-id={sectionId}
      style={{
        width: refCss(layout.frameW),
        marginLeft: refCss(layout.frameX),
        marginTop:
          stackGap && lead
            ? imageMarginTopCss(slug, sectionId, lead, grid)
            : undefined,
        maxWidth: "100%",
        aspectRatio: `${layout.frameW} / ${layout.frameH}`,
      }}
    >
      {layout.pieces.map((piece, i) => {
        const img = piece.img;
        const w = img.naturalWidth ?? 1600;
        const h = img.naturalHeight ?? 1200;
        const preOptimized = isPreOptimizedSrc(img.src);
        return (
          <div
            key={`${img.src}-${i}`}
            className="project-composition__piece absolute"
            style={{
              left: `${(piece.x / layout.frameW) * 100}%`,
              top: `${(piece.y / layout.frameH) * 100}%`,
              width: `${(piece.w / layout.frameW) * 100}%`,
              aspectRatio: `${piece.w} / ${piece.h}`,
            }}
          >
            {isVideoSrc(img.src) ? (
              <video
                src={img.src}
                autoPlay
                loop
                muted
                playsInline
                className="block h-full w-full object-contain object-left-top"
              />
            ) : (
              <Image
                src={img.src}
                alt={img.alt}
                width={w}
                height={h}
                sizes={`(max-width: ${REF_WIDTH}px) ${Math.ceil(piece.w)}px, ${Math.ceil(piece.w)}px`}
                quality={88}
                priority={priority && i === 0}
                unoptimized={preOptimized}
                className="block h-full w-full object-contain object-left-top"
              />
            )}
          </div>
        );
      })}
    </figure>
  );
}

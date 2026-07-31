"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ProjectImage } from "@/content/types";
import type { ProjectGrid } from "@/content/grid/registry";
import {
  imageAspectRatioCss,
  imageDisplayWidthCss,
  imageMarginLeftCss,
  imageMarginTopCss,
  imageSizesAttr,
} from "@/lib/image-layout";
import { isPreOptimizedSrc, isVideoSrc } from "@/lib/project-media";

interface Props {
  slug: string;
  grid: ProjectGrid;
  sectionId: string;
  images: ProjectImage[];
  intervalMs: number;
  priority?: boolean;
  /** When false, omit desktop width/margin layout (mobile full-bleed). */
  applyDesktopLayout?: boolean;
  className?: string;
}

/** Brief crossfade so furniture morphs while architecture stays locked. */
const CROSSFADE_MS = 180;

export default function CyclingProjectFigure({
  slug,
  grid,
  sectionId,
  images,
  intervalMs,
  priority,
  applyDesktopLayout = true,
  className,
}: Props) {
  const [index, setIndex] = useState(0);
  const frame = images[0];

  useEffect(() => {
    if (images.length < 2) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs]);

  if (!frame) return null;

  // Locked frame from explicit crop height when present (identical across cycle).
  const frameSource =
    images.find((img) => img.displayHeightRef != null) ?? frame;
  const aspectRatio = imageAspectRatioCss(
    slug,
    sectionId,
    frameSource,
    grid
  );

  const layoutStyle = applyDesktopLayout
    ? {
        width: imageDisplayWidthCss(slug, sectionId, frame, grid),
        marginLeft: imageMarginLeftCss(slug, sectionId, frame, grid),
        marginTop: priority
          ? undefined
          : imageMarginTopCss(slug, sectionId, frame, grid),
        maxWidth: "100%" as const,
        aspectRatio,
      }
    : {
        width: "100%" as const,
        aspectRatio,
      };

  return (
    <figure
      className={`project-figure relative m-0 shrink-0 overflow-hidden bg-black ${className ?? ""}`}
      style={layoutStyle}
    >
      {images.map((img, i) => {
        const w = img.naturalWidth ?? 1600;
        const h = img.naturalHeight ?? 1200;
        const preOptimized = isPreOptimizedSrc(img.src);
        const visible = i === index;
        // Fill the locked box exactly — assets are pre-aligned to one FOV.
        const mediaClass =
          "absolute inset-0 block h-full w-full object-fill";

        return isVideoSrc(img.src) ? (
          <video
            key={img.src}
            src={img.src}
            autoPlay
            loop
            muted
            playsInline
            className={mediaClass}
            style={{
              opacity: visible ? 1 : 0,
              transition: `opacity ${CROSSFADE_MS}ms linear`,
            }}
            aria-hidden={!visible}
          />
        ) : (
          <Image
            key={img.src}
            src={img.src}
            alt={visible ? img.alt : ""}
            width={w}
            height={h}
            sizes={
              applyDesktopLayout
                ? imageSizesAttr(slug, sectionId, frame, grid)
                : "100vw"
            }
            quality={88}
            priority={priority && i === 0}
            unoptimized={preOptimized}
            className={mediaClass}
            style={{
              opacity: visible ? 1 : 0,
              transition: `opacity ${CROSSFADE_MS}ms linear`,
            }}
            aria-hidden={!visible}
          />
        );
      })}
    </figure>
  );
}

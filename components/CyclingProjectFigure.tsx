"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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

/** Crossfade duration — previous frame stays opaque underneath (no black flash). */
const CROSSFADE_MS = 280;

function CycleMedia({
  img,
  frame,
  slug,
  sectionId,
  grid,
  applyDesktopLayout,
  priority,
  opacity,
  zIndex,
  fade,
}: {
  img: ProjectImage;
  frame: ProjectImage;
  slug: string;
  sectionId: string;
  grid: ProjectGrid;
  applyDesktopLayout: boolean;
  priority?: boolean;
  opacity: number;
  zIndex: number;
  fade: boolean;
}) {
  const w = img.naturalWidth ?? 1600;
  const h = img.naturalHeight ?? 1200;
  const preOptimized = isPreOptimizedSrc(img.src);
  const mediaClass = "absolute inset-0 block h-full w-full object-fill";
  const style = {
    opacity,
    zIndex,
    transition: fade ? `opacity ${CROSSFADE_MS}ms linear` : undefined,
  };

  if (isVideoSrc(img.src)) {
    return (
      <video
        src={img.src}
        autoPlay
        loop
        muted
        playsInline
        className={mediaClass}
        style={style}
        aria-hidden={opacity < 1}
      />
    );
  }

  return (
    <Image
      src={img.src}
      alt={opacity > 0 ? img.alt : ""}
      width={w}
      height={h}
      sizes={
        applyDesktopLayout
          ? imageSizesAttr(slug, sectionId, frame, grid)
          : "100vw"
      }
      quality={88}
      priority={priority}
      unoptimized={preOptimized}
      className={mediaClass}
      style={style}
      aria-hidden={opacity < 1}
    />
  );
}

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
  const [active, setActive] = useState(0);
  const [base, setBase] = useState(0);
  const [overlayOn, setOverlayOn] = useState(true);
  const activeRef = useRef(0);
  const countRef = useRef(images.length);
  countRef.current = images.length;
  const frame = images[0];

  useEffect(() => {
    if (images.length < 2) return;
    const ms = Math.max(400, intervalMs || 1000);
    const id = window.setInterval(() => {
      const from = activeRef.current;
      const to = (from + 1) % countRef.current;
      setBase(from);
      setActive(to);
      setOverlayOn(false);
      activeRef.current = to;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setOverlayOn(true));
      });
    }, ms);
    return () => window.clearInterval(id);
  }, [images.length, intervalMs]);

  if (!frame) return null;

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

  const baseImg = images[base] ?? frame;
  const activeImg = images[active] ?? frame;
  const same = base === active;

  return (
    <figure
      className={`project-figure relative m-0 shrink-0 overflow-hidden ${className ?? ""}`}
      style={layoutStyle}
      data-cycle-index={active}
    >
      {/* Opaque under-layer — holds the previous frame so the fade never hits black. */}
      <CycleMedia
        img={baseImg}
        frame={frame}
        slug={slug}
        sectionId={sectionId}
        grid={grid}
        applyDesktopLayout={applyDesktopLayout}
        priority={priority}
        opacity={1}
        zIndex={1}
        fade={false}
      />
      {!same ? (
        <CycleMedia
          img={activeImg}
          frame={frame}
          slug={slug}
          sectionId={sectionId}
          grid={grid}
          applyDesktopLayout={applyDesktopLayout}
          opacity={overlayOn ? 1 : 0}
          zIndex={2}
          fade
        />
      ) : null}
    </figure>
  );
}

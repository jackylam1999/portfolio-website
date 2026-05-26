"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { Suspense } from "react";
import type { Project } from "@/content/types";
import MobileLayoutGrid from "@/components/mobile/MobileLayoutGrid";
import {
  flattenProjectSlides,
  formatImageCount,
  projectInfoContent,
} from "@/lib/mobile-project-slides";

type ViewMode = "viewer" | "gallery" | "info";

interface Props {
  project: Project;
}

function rectsOverlap(
  a: { top: number; bottom: number; left: number; right: number },
  b: { top: number; bottom: number; left: number; right: number }
): boolean {
  return a.top < b.bottom && a.bottom > b.top && a.left < b.right && a.right > b.left;
}

export default function MobileProjectPage({ project }: Props) {
  const slides = flattenProjectSlides(project);
  const info = projectInfoContent(project);
  const countLabel = formatImageCount(slides.length);

  const [mode, setMode] = useState<ViewMode>("viewer");
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedDrawingLabel, setDisplayedDrawingLabel] = useState(
    slides[0]?.pillLabel ?? "—"
  );
  const lastViewerIndex = useRef(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const scrollRaf = useRef<number | null>(null);

  const currentSlide = slides[activeIndex];

  const isDrawingTitleCovered = useCallback(() => {
    const zone = titleRef.current?.getBoundingClientRect();
    const track = trackRef.current;
    if (!zone || !track) return false;

    const layers = track.querySelectorAll<HTMLElement>(".mobile-viewer-slide");
    for (const layer of layers) {
      const rect = layer.getBoundingClientRect();
      if (rectsOverlap(rect, zone)) return true;
    }
    return false;
  }, []);

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "auto") => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, index));
    const slideEls = track.querySelectorAll<HTMLElement>(".mobile-viewer-slide");
    const target = slideEls[clamped];
    if (target) {
      track.scrollTo({ top: target.offsetTop, behavior });
    }
    setActiveIndex(clamped);
    lastViewerIndex.current = clamped;
    setDisplayedDrawingLabel(slides[clamped]?.pillLabel ?? "—");
  }, [slides]);

  const syncDrawingLabel = useCallback(
    (index: number, force = false) => {
      const label = slides[index]?.pillLabel ?? "—";
      if (force || isDrawingTitleCovered()) {
        setDisplayedDrawingLabel(label);
      }
    },
    [isDrawingTitleCovered, slides]
  );

  const onTrackScroll = useCallback(() => {
    if (scrollRaf.current != null) cancelAnimationFrame(scrollRaf.current);
    scrollRaf.current = requestAnimationFrame(() => {
      syncDrawingLabel(lastViewerIndex.current);
    });
  }, [syncDrawingLabel]);

  useEffect(() => {
    if (mode !== "viewer" || !slides.length) return;

    const track = trackRef.current;
    if (!track) return;

    const slideEls = Array.from(
      track.querySelectorAll<HTMLElement>(".mobile-viewer-slide")
    );
    if (!slideEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let bestIndex = -1;
        let bestRatio = 0;

        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = slideEls.indexOf(entry.target as HTMLElement);
          if (index < 0) continue;
          if (entry.intersectionRatio > bestRatio) {
            bestRatio = entry.intersectionRatio;
            bestIndex = index;
          }
        }

        if (bestIndex >= 0) {
          setActiveIndex(bestIndex);
          lastViewerIndex.current = bestIndex;
          syncDrawingLabel(bestIndex);
        }
      },
      {
        root: track,
        threshold: [0.35, 0.5, 0.65, 0.85, 1],
      }
    );

    slideEls.forEach((el) => observer.observe(el));

    const onScrollEnd = () => syncDrawingLabel(lastViewerIndex.current, true);
    track.addEventListener("scrollend", onScrollEnd);

    return () => {
      observer.disconnect();
      track.removeEventListener("scrollend", onScrollEnd);
    };
  }, [mode, slides.length, syncDrawingLabel]);

  useEffect(() => {
    if (mode !== "viewer") return;
    requestAnimationFrame(() => scrollToIndex(lastViewerIndex.current));
  }, [mode, scrollToIndex]);

  const toggleInfo = () => {
    if (mode === "info") {
      setMode("viewer");
      scrollToIndex(lastViewerIndex.current);
      return;
    }
    lastViewerIndex.current = activeIndex;
    setMode("info");
  };

  const toggleGallery = () => {
    if (mode === "gallery") {
      setMode("viewer");
      scrollToIndex(lastViewerIndex.current);
      return;
    }
    lastViewerIndex.current = activeIndex;
    setMode("gallery");
  };

  const openSlide = (index: number) => {
    lastViewerIndex.current = index;
    setActiveIndex(index);
    setMode("viewer");
    requestAnimationFrame(() => scrollToIndex(index));
  };

  const showProjectTitle = mode === "info" || mode === "gallery";
  const topLeftLabel = showProjectTitle
    ? project.title
    : displayedDrawingLabel;
  const topLeftVariant = showProjectTitle ? "project" : "drawing";

  if (!slides.length) {
    return (
      <div className="mobile-viewer mobile-viewer--empty">
        <CornerChrome
          titleRef={titleRef}
          topLeftLabel="—"
          topLeftVariant="drawing"
          countLabel="00"
          mode={mode}
          onInfo={toggleInfo}
          onGallery={toggleGallery}
        />
        <p className="mobile-viewer-empty type-body">No images in this project yet.</p>
      </div>
    );
  }

  return (
    <div className="mobile-viewer">
      <Suspense fallback={null}>
        <MobileLayoutGrid />
      </Suspense>

      <CornerChrome
        titleRef={titleRef}
        topLeftLabel={topLeftLabel}
        topLeftVariant={topLeftVariant}
        countLabel={countLabel}
        mode={mode}
        onInfo={toggleInfo}
        onGallery={toggleGallery}
      />

      <div
        className={
          "mobile-viewer-stage" +
          (mode === "info" ? " mobile-viewer-stage--info" : "") +
          (mode === "gallery" ? " mobile-viewer-stage--gallery" : "")
        }
      >
        <div
          ref={trackRef}
          className={
            "mobile-viewer-track" +
            (mode !== "viewer" ? " mobile-viewer-track--hidden" : "")
          }
          onScroll={onTrackScroll}
          aria-hidden={mode !== "viewer"}
        >
          {slides.map((slide, i) => (
            <SlideImage key={`${slide.sectionId}-${i}`} slide={slide} priority={i === 0} />
          ))}
        </div>

        {mode === "gallery" ? (
          <GalleryGrid slides={slides} onSelect={openSlide} />
        ) : null}

        {mode === "info" ? (
          <InfoPanel specs={info.specs} paragraphs={info.paragraphs} slide={currentSlide} />
        ) : null}
      </div>
    </div>
  );
}

function CornerChrome({
  titleRef,
  topLeftLabel,
  topLeftVariant,
  countLabel,
  mode,
  onInfo,
  onGallery,
}: {
  titleRef: RefObject<HTMLSpanElement | null>;
  topLeftLabel: string;
  topLeftVariant: "drawing" | "project";
  countLabel: string;
  mode: ViewMode;
  onInfo: () => void;
  onGallery: () => void;
}) {
  return (
    <div className="mobile-viewer-chrome" aria-label="Project controls">
      <span
        ref={titleRef}
        className={
          "mobile-viewer-chrome__tl" +
          (topLeftVariant === "project" ? " mobile-viewer-chrome__tl--project" : "")
        }
      >
        {topLeftLabel}
      </span>

      <button
        type="button"
        className={
          "mobile-viewer-chrome__btn mobile-viewer-chrome__tr" +
          (mode === "info" ? " mobile-viewer-chrome__btn--active" : "")
        }
        onClick={onInfo}
      >
        Info
      </button>

      <button
        type="button"
        className={
          "mobile-viewer-chrome__btn mobile-viewer-chrome__bl" +
          (mode === "gallery" ? " mobile-viewer-chrome__btn--active" : "")
        }
        onClick={onGallery}
      >
        All Images ({countLabel})
      </button>

      <Link href="/" className="mobile-viewer-chrome__btn mobile-viewer-chrome__br">
        Close
      </Link>
    </div>
  );
}

function SlideImage({
  slide,
  priority,
}: {
  slide: { image: { src: string; alt: string; naturalWidth?: number; naturalHeight?: number } };
  priority?: boolean;
}) {
  const img = slide.image;
  const w = img.naturalWidth ?? 1600;
  const h = img.naturalHeight ?? 1200;
  const preOptimized = img.src.endsWith(".webp");
  const orientation = w >= h ? "landscape" : "portrait";

  return (
    <figure
      className={`mobile-viewer-slide mobile-viewer-slide--${orientation} project-figure`}
    >
      <Image
        src={img.src}
        alt={img.alt}
        width={w}
        height={h}
        sizes="100vw"
        quality={88}
        priority={priority}
        unoptimized={preOptimized}
        className="mobile-viewer-slide__img"
        draggable={false}
      />
    </figure>
  );
}

function GalleryGrid({
  slides,
  onSelect,
}: {
  slides: ReturnType<typeof flattenProjectSlides>;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mobile-viewer-gallery" role="list">
      {slides.map((slide, i) => {
        const img = slide.image;
        const w = img.naturalWidth ?? 800;
        const h = img.naturalHeight ?? 600;
        const preOptimized = img.src.endsWith(".webp");
        return (
          <button
            key={`${slide.sectionId}-${i}`}
            type="button"
            role="listitem"
            className="mobile-viewer-thumb"
            onClick={() => onSelect(i)}
            aria-label={slide.pillLabel}
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={w}
              height={h}
              sizes="22vw"
              quality={75}
              unoptimized={preOptimized}
              className="mobile-viewer-thumb__img"
            />
          </button>
        );
      })}
    </div>
  );
}

function InfoPanel({
  specs,
  paragraphs,
  slide,
}: {
  specs: { label: string; value: string }[];
  paragraphs: string[];
  slide: ReturnType<typeof flattenProjectSlides>[number] | undefined;
}) {
  return (
    <div className="mobile-viewer-info">
      {slide ? (
        <div className="mobile-viewer-info__fade" aria-hidden>
          <SlideImage slide={slide} />
        </div>
      ) : null}
      <div className="mobile-viewer-info__content type-body">
        {specs.length ? (
          <dl className="mobile-viewer-info__specs">
            {specs.map((row) => (
              <div key={row.label} className="mobile-viewer-info__spec-row">
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {paragraphs.length ? (
          <div className="mobile-viewer-info__text">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

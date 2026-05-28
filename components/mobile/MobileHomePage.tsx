"use client";

import EditAwareLink from "@/components/EditAwareLink";
import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";
import cvContent from "@/content/cv.json";
import { homeCarouselSlides } from "@/content/mobile-home-carousel";
import { projects } from "@/content/projects";
import { siteConfig } from "@/content/site";

type HomeMode = "landing" | "index";

const AUTO_MS = 5000;
const FADE_MS = 200;
const SWIPE_PX = 48;

export default function MobileHomePage() {
  const slides = homeCarouselSlides();
  const [mode, setMode] = useState<HomeMode>("landing");
  const [index, setIndex] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);

  const current = slides[index];

  const transitionTo = useCallback(
    (nextIndex: number) => {
      if (!slides.length) return;
      const clamped = (nextIndex + slides.length) % slides.length;
      if (clamped === index) return;

      setFadeIn(false);
      window.setTimeout(() => {
        setIndex(clamped);
        setFadeIn(true);
      }, FADE_MS);
    },
    [index, slides.length]
  );

  const goNext = useCallback(() => {
    transitionTo(index + 1);
  }, [index, transitionTo]);

  const goPrev = useCallback(() => {
    transitionTo(index - 1);
  }, [index, transitionTo]);

  const resetTimer = useCallback(() => {
    if (timerRef.current != null) window.clearInterval(timerRef.current);
    if (mode !== "landing" || slides.length < 2) return;
    timerRef.current = window.setInterval(goNext, AUTO_MS);
  }, [goNext, mode, slides.length]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current != null) window.clearInterval(timerRef.current);
    };
  }, [resetTimer, index]);

  const toggleIndex = () => {
    setMode((m) => (m === "index" ? "landing" : "index"));
  };

  const goLanding = () => {
    setMode("landing");
  };

  const onTouchStart = (e: ReactTouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: ReactTouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const dx = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < SWIPE_PX) return;
    if (dx < 0) goNext();
    else goPrev();
    resetTimer();
  };

  const onCarouselTap = () => {
    goNext();
    resetTimer();
  };

  const awards =
    cvContent.sections.find((s) => s.heading === "Awards")?.entries ?? [];

  return (
    <div
      className={
        "mobile-home" + (mode === "index" ? " mobile-home--panel" : "")
      }
    >
      <HomeChrome mode={mode} onName={goLanding} onIndex={toggleIndex} />

      <div className="mobile-home-stage">
        <div
          className={
            "mobile-home-panel mobile-home-panel--landing" +
            (mode === "landing" ? " mobile-home-panel--active" : "")
          }
        >
          {current ? (
            <div className="mobile-home-carousel">
              <button
                type="button"
                className="mobile-home-carousel__stage"
                onClick={onCarouselTap}
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
                aria-label={`${current.title}, ${current.year}. Tap for next project.`}
              >
                <div
                  className={
                    "mobile-home-carousel__image-wrap" +
                    (fadeIn ? " mobile-home-carousel__image-wrap--in" : "")
                  }
                >
                  <Image
                    src={current.image.src}
                    alt={current.image.alt || current.title}
                    width={current.image.naturalWidth ?? 1200}
                    height={current.image.naturalHeight ?? 900}
                    sizes="90vw"
                    quality={88}
                    priority
                    unoptimized={current.image.src.endsWith(".webp")}
                    className="mobile-home-carousel__img"
                    draggable={false}
                  />
                </div>
              </button>

              <div className="mobile-home-carousel__meta">
                <p className="mobile-home-carousel__title">
                  {current.title}, {current.year}
                </p>
                <EditAwareLink
                  href={`/projects/${current.slug}`}
                  className="mobile-home-carousel__cta"
                >
                  Click to View
                </EditAwareLink>
              </div>
            </div>
          ) : (
            <p className="mobile-home-empty type-body">No carousel images yet.</p>
          )}
        </div>

        <div
          className={
            "mobile-home-panel mobile-home-panel--index" +
            (mode === "index" ? " mobile-home-panel--active" : "")
          }
        >
          <div className="mobile-home-index type-body">
            <section className="mobile-home-index__section">
              <h2 className="mobile-home-index__heading">works</h2>
              <ul className="mobile-home-index__list">
                {projects.map((p) => (
                  <li key={p.slug}>
                    <EditAwareLink
                      href={`/projects/${p.slug}`}
                      className="mobile-home-index__link"
                    >
                      {p.title}
                    </EditAwareLink>
                  </li>
                ))}
              </ul>
            </section>

            <section className="mobile-home-index__section">
              <h2 className="mobile-home-index__heading">contacts</h2>
              <ul className="mobile-home-index__list">
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="mobile-home-index__link"
                  >
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <EditAwareLink href="/contact" className="mobile-home-index__link">
                    Contact page
                  </EditAwareLink>
                </li>
              </ul>
            </section>

            <section className="mobile-home-index__section">
              <h2 className="mobile-home-index__heading">recognition</h2>
              <ul className="mobile-home-index__list mobile-home-index__list--recognition">
                {awards.map((entry, i) => (
                  <li key={i} className="mobile-home-index__recognition">
                    <span className="mobile-home-index__year">{entry.year}</span>
                    <span>{entry.title}</span>
                    {entry.subtitle ? (
                      <span className="mobile-home-index__subtitle">{entry.subtitle}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function HomeChrome({
  mode,
  onName,
  onIndex,
}: {
  mode: HomeMode;
  onName: () => void;
  onIndex: () => void;
}) {
  return (
    <>
      <div className="mobile-home-chrome-under">
        <span className="mobile-home-chrome__tl">{siteConfig.name}</span>
        <span
          className={
            "mobile-home-chrome__label mobile-home-chrome__tr" +
            (mode === "index" ? " mobile-home-chrome__label--active" : "")
          }
        >
          index
        </span>
      </div>

      <div className="mobile-home-chrome-over" aria-label="Site controls">
        <Link
          href="/"
          className="mobile-home-chrome__btn mobile-home-chrome__tl"
          onClick={(e) => {
            e.preventDefault();
            onName();
          }}
          aria-label={siteConfig.name}
        >
          {siteConfig.name}
        </Link>

        <button
          type="button"
          className="mobile-home-chrome__btn mobile-home-chrome__tr"
          onClick={onIndex}
          aria-label="Index"
        >
          index
        </button>
      </div>
    </>
  );
}

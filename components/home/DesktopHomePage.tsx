"use client";

import EditAwareLink from "@/components/EditAwareLink";
import HomeGalleryTile from "@/components/home/HomeGalleryTile";
import cvContent from "@/content/cv.json";
import { homeGalleryRows } from "@/content/home-gallery";
import { projects } from "@/content/projects";
import { siteConfig } from "@/content/site";
import Link from "next/link";
import { useEffect, useState } from "react";

type HomeMode = "landing" | "index";

export default function DesktopHomePage() {
  const [mode, setMode] = useState<HomeMode>("landing");

  useEffect(() => {
    document.documentElement.dataset.homeDesktop = "1";
    return () => {
      delete document.documentElement.dataset.homeDesktop;
    };
  }, []);

  const toggleIndex = () => {
    setMode((m) => (m === "index" ? "landing" : "index"));
  };

  const goLanding = () => {
    setMode("landing");
  };

  const awards =
    cvContent.sections.find((s) => s.heading === "Awards")?.entries ?? [];

  return (
    <div
      className={
        "desktop-home" + (mode === "index" ? " desktop-home--index-open" : "")
      }
    >
      <div className="desktop-home-chrome-under" aria-hidden>
        <span className="desktop-home-chrome__tl">{siteConfig.name}</span>
        <span
          className={
            "desktop-home-chrome__label desktop-home-chrome__tr" +
            (mode === "index" ? " desktop-home-chrome__label--active" : "")
          }
        >
          index
        </span>
      </div>

      <div className="desktop-home-chrome-over" aria-label="Site controls">
        <Link
          href="/"
          className="desktop-home-chrome__btn desktop-home-chrome__tl"
          onClick={(e) => {
            e.preventDefault();
            goLanding();
          }}
        >
          {siteConfig.name}
        </Link>
        <button
          type="button"
          className="desktop-home-chrome__btn desktop-home-chrome__tr"
          onClick={toggleIndex}
          aria-expanded={mode === "index"}
          aria-label="Index"
        >
          index
        </button>
      </div>

      <div className="desktop-home-stage">
        <div
          className={
            "desktop-home-panel desktop-home-panel--landing" +
            (mode === "landing" ? " desktop-home-panel--active" : "")
          }
        >
          <div className="desktop-home-gallery">
            {homeGalleryRows.map((row, rowIndex) => (
              <div key={rowIndex} className="home-gallery-row">
                {row.items.map((item, i) => (
                  <HomeGalleryTile
                    key={`${item.slug}-${rowIndex}-${i}`}
                    item={item}
                    priority={rowIndex === 0 && i < 2}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div
          className={
            "desktop-home-panel desktop-home-panel--index" +
            (mode === "index" ? " desktop-home-panel--active" : "")
          }
        >
          <div className="desktop-home-index type-body">
            <section className="desktop-home-index__section">
              <h2 className="desktop-home-index__heading">works</h2>
              <ul className="desktop-home-index__list">
                {projects.map((p) => (
                  <li key={p.slug}>
                    <EditAwareLink
                      href={`/projects/${p.slug}`}
                      className="desktop-home-index__link"
                    >
                      {p.title}
                    </EditAwareLink>
                  </li>
                ))}
              </ul>
            </section>

            <section className="desktop-home-index__section">
              <h2 className="desktop-home-index__heading">contacts</h2>
              <ul className="desktop-home-index__list">
                <li>
                  <a
                    href={`mailto:${siteConfig.email}`}
                    className="desktop-home-index__link"
                  >
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <EditAwareLink href="/contact" className="desktop-home-index__link">
                    Contact page
                  </EditAwareLink>
                </li>
              </ul>
            </section>

            <section className="desktop-home-index__section">
              <h2 className="desktop-home-index__heading">recognition</h2>
              <ul className="desktop-home-index__list desktop-home-index__list--recognition">
                {awards.map((entry, i) => (
                  <li key={i} className="desktop-home-index__recognition">
                    <span className="desktop-home-index__year">{entry.year}</span>
                    <span>{entry.title}</span>
                    {entry.subtitle ? (
                      <span className="desktop-home-index__subtitle">{entry.subtitle}</span>
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

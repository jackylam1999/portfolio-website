"use client";

import { useEffect, useState } from "react";
import type { ProjectSection } from "@/content/types";
import { scrollReferenceY } from "@/lib/scroll-reference";
import {
  activeSectionByTop,
  clearPendingScrollTarget,
  getPendingScrollTargetId,
  SECTION_SCROLL_PIN,
  SECTION_SCROLL_SETTLED,
  sectionDrawingEl,
} from "@/lib/section-anchor";

/**
 * Tracks which drawing title the red arrow should mark.
 *
 * Samples every top-level desktop `.project-figure` (compositions count as one)
 * against `--site-content-top` on rAF-throttled scroll. Click-to-scroll pins
 * until settle or the user takes over with wheel/touch.
 */
export function useActiveSectionId(sections: ProjectSection[]) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const ids = sections.map((s) => s.id);
    let raf = 0;

    const resolve = () => {
      const pending = getPendingScrollTargetId();
      if (pending && ids.includes(pending)) {
        setActiveId(pending);
        return;
      }
      setActiveId(activeSectionByTop(ids, scrollReferenceY()));
    };

    const schedule = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        resolve();
      });
    };

    const onUserScrollIntent = () => {
      clearPendingScrollTarget();
      schedule();
    };

    resolve();

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("wheel", onUserScrollIntent, { passive: true });
    window.addEventListener("touchmove", onUserScrollIntent, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener(SECTION_SCROLL_PIN, resolve);
    window.addEventListener(SECTION_SCROLL_SETTLED, resolve);

    const root = document.querySelector(".project-layout-desktop");
    const ro = new ResizeObserver(schedule);
    if (root) ro.observe(root);

    for (const id of ids) {
      const el = sectionDrawingEl(id);
      if (el) ro.observe(el);
      const section = document.querySelector(
        `.project-layout-desktop section#${CSS.escape(id)} .project-image-column`
      );
      if (section) {
        ro.observe(section);
        section.querySelectorAll(".project-figure").forEach((fig) => ro.observe(fig));
      }
    }

    const imgs = document.querySelectorAll<HTMLImageElement>(
      ".project-layout-desktop .project-figure img"
    );
    const onImg = () => schedule();
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener("load", onImg, { once: true });
    });

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("wheel", onUserScrollIntent);
      window.removeEventListener("touchmove", onUserScrollIntent);
      window.removeEventListener("resize", schedule);
      window.removeEventListener(SECTION_SCROLL_PIN, resolve);
      window.removeEventListener(SECTION_SCROLL_SETTLED, resolve);
      ro.disconnect();
      imgs.forEach((img) => img.removeEventListener("load", onImg));
    };
  }, [sections]);

  return activeId;
}

"use client";

import { useEffect, useState } from "react";
import type { ProjectSection } from "@/content/types";
import { scrollReferenceY } from "@/lib/scroll-reference";
import {
  activeSectionByTop,
  clearPendingScrollTarget,
  getPendingScrollTargetId,
  SECTION_SCROLL_SETTLED,
  sectionDrawingEl,
} from "@/lib/section-anchor";

export function useActiveSectionId(sections: ProjectSection[]) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const ids = sections.map((s) => s.id);

    const update = () => {
      const pending = getPendingScrollTargetId();
      if (pending && ids.includes(pending)) {
        setActiveId(pending);
        return;
      }
      setActiveId(activeSectionByTop(ids, scrollReferenceY()));
    };

    const onUserScroll = () => {
      // Wheel / touch means the user took over — stop pinning the click target.
      clearPendingScrollTarget();
      update();
    };

    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("wheel", onUserScroll, { passive: true });
    window.addEventListener("touchmove", onUserScroll, { passive: true });
    window.addEventListener("resize", update);
    window.addEventListener(SECTION_SCROLL_SETTLED, update);

    const ro = new ResizeObserver(update);
    const mo = new MutationObserver(update);

    for (const s of sections) {
      const anchor = sectionDrawingEl(s.id);
      if (anchor) {
        ro.observe(anchor);
        mo.observe(anchor, { attributes: true, attributeFilter: ["style"] });
      }
      const section = document.querySelector(
        `.project-layout-desktop section#${CSS.escape(s.id)}`
      );
      if (section) {
        ro.observe(section);
        section.querySelectorAll(".project-figure").forEach((fig) => {
          ro.observe(fig);
        });
      }
    }

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("wheel", onUserScroll);
      window.removeEventListener("touchmove", onUserScroll);
      window.removeEventListener("resize", update);
      window.removeEventListener(SECTION_SCROLL_SETTLED, update);
      ro.disconnect();
      mo.disconnect();
    };
  }, [sections]);

  return activeId;
}

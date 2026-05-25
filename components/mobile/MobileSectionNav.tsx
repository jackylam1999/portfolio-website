"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ProjectSection } from "@/content/types";
import { useActiveSectionId } from "@/hooks/useActiveSectionId";
import { scrollToMobileSection } from "@/lib/mobile-section-anchor";

interface Props {
  sections: ProjectSection[];
}

/** Sticky horizontal section list — tap to scroll, accent on active. */
export default function MobileSectionNav({ sections }: Props) {
  const activeId = useActiveSectionId(sections);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLButtonElement>());

  const scrollActiveIntoView = useCallback(() => {
    const scroller = scrollerRef.current;
    const activeBtn = itemRefs.current.get(activeId);
    if (!scroller || !activeBtn) return;

    const scrollerRect = scroller.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    const offset =
      btnRect.left -
      scrollerRect.left -
      scrollerRect.width / 2 +
      btnRect.width / 2;

    scroller.scrollBy({ left: offset, behavior: "smooth" });
  }, [activeId]);

  useEffect(() => {
    scrollActiveIntoView();
  }, [scrollActiveIntoView, activeId]);

  return (
    <nav
      aria-label="Section navigation"
      className="mobile-section-nav"
    >
      <div ref={scrollerRef} className="mobile-section-nav__scroller">
        {sections.map((s) => {
          const active = s.id === activeId;
          return (
            <button
              key={s.id}
              type="button"
              ref={(el) => {
                if (el) itemRefs.current.set(s.id, el);
                else itemRefs.current.delete(s.id);
              }}
              className={
                "mobile-section-nav__pill type-nav" +
                (active ? " mobile-section-nav__pill--active" : "")
              }
              onClick={() => scrollToMobileSection(s.id)}
            >
              {s.pillLabel}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

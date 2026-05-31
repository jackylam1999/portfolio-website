"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { ProjectSection } from "@/content/types";
import { useActiveSectionId } from "@/hooks/useActiveSectionId";
import { scrollToSectionDrawing, SECTION_SCROLL_SETTLED } from "@/lib/section-anchor";

interface Props {
  sections: ProjectSection[];
}

/**
 * Per-section drawing list — fixed right edge, aligned with image scroll area.
 * Single triangle slides between rows as the active section changes on scroll.
 */
export default function ScrollSpyPills({ sections }: Props) {
  const activeId = useActiveSectionId(sections);
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const [markerY, setMarkerY] = useState(0);
  const [markerReady, setMarkerReady] = useState(false);

  const updateMarkerPosition = useCallback(() => {
    const list = listRef.current;
    const activeItem = itemRefs.current.get(activeId);
    if (!list || !activeItem) return;

    const listTop = list.getBoundingClientRect().top;
    const itemRect = activeItem.getBoundingClientRect();
    setMarkerY(itemRect.top + itemRect.height / 2 - listTop);
    setMarkerReady(true);
  }, [activeId]);

  useLayoutEffect(() => {
    updateMarkerPosition();
  }, [updateMarkerPosition, sections]);

  useLayoutEffect(() => {
    const onSettled = () => updateMarkerPosition();
    window.addEventListener(SECTION_SCROLL_SETTLED, onSettled);
    return () => window.removeEventListener(SECTION_SCROLL_SETTLED, onSettled);
  }, [updateMarkerPosition]);

  useLayoutEffect(() => {
    window.addEventListener("scroll", updateMarkerPosition, { passive: true });
    window.addEventListener("resize", updateMarkerPosition);
    return () => {
      window.removeEventListener("scroll", updateMarkerPosition);
      window.removeEventListener("resize", updateMarkerPosition);
    };
  }, [updateMarkerPosition]);

  const handleClick = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToSectionDrawing(id);
  };

  const setItemRef = (id: string) => (el: HTMLLIElement | null) => {
    if (el) itemRefs.current.set(id, el);
    else itemRefs.current.delete(id);
  };

  return (
    <aside
      aria-label="Section navigation"
      className="site-fixed-drawings type-nav select-none tracking-tightish text-black"
    >
      <div className="relative">
        <span
          aria-hidden
          className="drawing-active-marker"
          style={{
            opacity: markerReady ? 1 : 0,
            transform: `translateY(calc(${markerY}px - 50%))`,
          }}
        >
          ◀
        </span>
        <ul ref={listRef} className="flex w-full flex-col items-end">
          {sections.map((s) => (
            <li
              key={s.id}
              ref={setItemRef(s.id)}
              className="relative flex items-center"
              style={{
                gap: "var(--site-drawing-gap)",
                ...(s.groupBreak ? { marginTop: "var(--site-group-break)" } : {}),
              }}
            >
              <a
                href={`#${s.id}`}
                onClick={handleClick(s.id)}
                className="cursor-interactive whitespace-nowrap"
              >
                {s.pillLabel}
              </a>
              {/* Spacer — keeps label position; sliding marker overlays this slot */}
              <span
                aria-hidden
                className="inline-block shrink-0"
                style={{ width: "var(--site-drawing-marker)" }}
              />
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

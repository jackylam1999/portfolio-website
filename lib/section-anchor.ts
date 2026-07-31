import { scrollReferenceY } from "@/lib/scroll-reference";

/** Fired after a menu click scroll finishes and any snap correction is applied. */
export const SECTION_SCROLL_SETTLED = "section-scroll-settled";

function desktopSectionEl(sectionId: string): HTMLElement | null {
  return document.querySelector<HTMLElement>(
    `.project-layout-desktop section#${CSS.escape(sectionId)}`
  );
}

/** The visible drawing anchor for a section — figure if present, else the section. */
export function sectionDrawingEl(sectionId: string): HTMLElement | null {
  const section = desktopSectionEl(sectionId) ?? document.getElementById(sectionId);
  if (!section) return null;
  return section.querySelector<HTMLElement>(".project-figure") ?? section;
}

/** Top edge of the drawing anchor in viewport coordinates. */
export function sectionDrawingTop(sectionId: string): number | null {
  const el = sectionDrawingEl(sectionId);
  if (!el) return null;
  return el.getBoundingClientRect().top;
}

let pendingScrollTargetId: string | null = null;
let scrollSession = 0;

/** While a drawing-menu click scroll is in flight, keep the triangle on this section. */
export function getPendingScrollTargetId(): string | null {
  return pendingScrollTargetId;
}

/** User took over scrolling — release the click-pin so spy tracks the viewport again. */
export function clearPendingScrollTarget(): void {
  if (!pendingScrollTargetId) return;
  pendingScrollTargetId = null;
  scrollSession += 1;
}

function scrollTopForSection(sectionId: string, refY: number): number | null {
  const el = sectionDrawingEl(sectionId);
  if (!el) return null;
  return el.getBoundingClientRect().top + window.scrollY - refY;
}

/** Nudge scroll so the drawing top sits exactly on the content reference line. */
export function snapSectionDrawingToReference(sectionId: string): boolean {
  const top = sectionDrawingTop(sectionId);
  if (top == null) return false;
  const refY = scrollReferenceY();
  const delta = top - refY;
  if (Math.abs(delta) < 0.5) return false;
  window.scrollBy({ top: delta, behavior: "auto" });
  return true;
}

function finishScrollSession(sessionId: number, sectionId: string): void {
  if (sessionId !== scrollSession) return;

  snapSectionDrawingToReference(sectionId);
  pendingScrollTargetId = null;

  window.dispatchEvent(new CustomEvent(SECTION_SCROLL_SETTLED, { detail: { sectionId } }));
}

/** Scroll so the drawing top edge aligns with the bottom purple content line. */
export function scrollToSectionDrawing(sectionId: string): void {
  const refY = scrollReferenceY();
  const targetTop = scrollTopForSection(sectionId, refY);
  if (targetTop == null) return;

  scrollSession += 1;
  const sessionId = scrollSession;
  pendingScrollTargetId = sectionId;

  window.scrollTo({
    top: targetTop,
    behavior: "smooth",
  });

  const settle = () => {
    window.removeEventListener("scrollend", onScrollEnd);
    if (fallbackTimer) clearTimeout(fallbackTimer);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => finishScrollSession(sessionId, sectionId));
    });
  };

  const onScrollEnd = () => settle();

  let fallbackTimer: ReturnType<typeof setTimeout> | undefined;
  if ("onscrollend" in window) {
    window.addEventListener("scrollend", onScrollEnd, { once: true });
    fallbackTimer = setTimeout(settle, 900);
  } else {
    fallbackTimer = setTimeout(settle, 650);
  }
}

type DrawingHit = { id: string; top: number; bottom: number };

function collectDrawingHits(sectionIds: string[]): DrawingHit[] {
  const hits: DrawingHit[] = [];

  for (const id of sectionIds) {
    const section = desktopSectionEl(id);
    if (!section) continue;

    const figures = section.querySelectorAll<HTMLElement>(".project-figure");
    if (figures.length === 0) {
      const r = section.getBoundingClientRect();
      if (r.height > 1) hits.push({ id, top: r.top, bottom: r.bottom });
      continue;
    }

    figures.forEach((fig) => {
      const r = fig.getBoundingClientRect();
      if (r.height > 1) hits.push({ id, top: r.top, bottom: r.bottom });
    });
  }

  return hits;
}

/**
 * Active section: prefer the drawing that currently crosses the content-top
 * line; otherwise the last drawing whose top edge has reached that line.
 * Uses every figure in a section (not only the first) so stacked/2-up rows
 * still keep the triangle on the section you are actually looking at.
 */
export function activeSectionByTop(
  sectionIds: string[],
  refY: number = scrollReferenceY()
): string {
  const hits = collectDrawingHits(sectionIds);
  if (!hits.length) return sectionIds[0] ?? "";

  const crossing = hits
    .filter((h) => h.top <= refY && h.bottom > refY)
    .sort((a, b) => b.top - a.top);
  if (crossing[0]) return crossing[0].id;

  let candidate = sectionIds[0] ?? "";
  let bestTop = -Infinity;
  for (const h of hits) {
    if (h.top <= refY && h.top > bestTop) {
      bestTop = h.top;
      candidate = h.id;
    }
  }

  return candidate;
}

import { scrollReferenceY } from "@/lib/scroll-reference";

/** Fired after a menu click scroll finishes and any snap correction is applied. */
export const SECTION_SCROLL_SETTLED = "section-scroll-settled";

/** The visible drawing anchor for a section — figure if present, else the section. */
export function sectionDrawingEl(sectionId: string): HTMLElement | null {
  const section = document.getElementById(sectionId);
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

/** Active section: last drawing whose top edge has reached the content-top line. */
export function activeSectionByTop(
  sectionIds: string[],
  refY: number = scrollReferenceY()
): string {
  let candidate = sectionIds[0] ?? "";
  let bestTop = -Infinity;

  for (const id of sectionIds) {
    const top = sectionDrawingTop(id);
    if (top == null) continue;
    if (top <= refY && top > bestTop) {
      bestTop = top;
      candidate = id;
    }
  }

  return candidate;
}

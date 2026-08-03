import { scrollReferenceY } from "@/lib/scroll-reference";

/** Fired after a menu click scroll finishes and any snap correction is applied. */
export const SECTION_SCROLL_SETTLED = "section-scroll-settled";

/** Fired when a menu click pins the triangle before smooth scroll starts. */
export const SECTION_SCROLL_PIN = "section-scroll-pin";

function desktopRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".project-layout-desktop");
}

function desktopSectionEl(sectionId: string): HTMLElement | null {
  const root = desktopRoot();
  if (!root) {
    return document.getElementById(sectionId) as HTMLElement | null;
  }
  return root.querySelector<HTMLElement>(
    `section#${CSS.escape(sectionId)}`
  );
}

/**
 * Click / scroll target for a drawing title — preferred `[data-drawing-anchor]`,
 * else the first figure in the section.
 */
export function sectionDrawingEl(sectionId: string): HTMLElement | null {
  const section = desktopSectionEl(sectionId);
  if (!section) return null;

  const anchored = section.querySelector<HTMLElement>("[data-drawing-anchor]");
  if (anchored) return anchored;

  return section.querySelector<HTMLElement>(".project-figure") ?? section;
}

/** Top edge of the drawing click-target in viewport coordinates. */
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

  window.dispatchEvent(
    new CustomEvent(SECTION_SCROLL_SETTLED, { detail: { sectionId } })
  );
}

/** Scroll so the drawing top edge aligns with the bottom purple content line. */
export function scrollToSectionDrawing(sectionId: string): void {
  const refY = scrollReferenceY();
  const targetTop = scrollTopForSection(sectionId, refY);
  if (targetTop == null) return;

  scrollSession += 1;
  const sessionId = scrollSession;
  pendingScrollTargetId = sectionId;
  window.dispatchEvent(
    new CustomEvent(SECTION_SCROLL_PIN, { detail: { sectionId } })
  );

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

function sectionIdFromFigure(fig: Element, idSet: Set<string>): string | null {
  const attr = fig.getAttribute("data-section-id");
  if (attr && idSet.has(attr)) return attr;
  const section = fig.closest("section[id]");
  const id = section?.id ?? null;
  return id && idSet.has(id) ? id : null;
}

/**
 * Prefer what is actually under the content-top line in the image column.
 * Samples several x positions so narrow drawings still register.
 */
function activeSectionByHitTest(
  sectionIds: string[],
  refY: number
): string | null {
  const root = desktopRoot();
  if (!root) return null;

  const idSet = new Set(sectionIds);
  const columns = root.querySelectorAll<HTMLElement>(".project-image-column");
  let colRect: DOMRect | null = null;
  for (const col of columns) {
    const r = col.getBoundingClientRect();
    if (r.width > 1 && r.bottom > refY - 2 && r.top < refY + 2) {
      colRect = r;
      break;
    }
  }
  if (!colRect) {
    const any = columns[0]?.getBoundingClientRect();
    if (any && any.width > 1) colRect = any;
  }
  if (!colRect) return null;

  const xs = [0.2, 0.5, 0.8].map((t) => colRect!.left + colRect!.width * t);

  for (const x of xs) {
    if (x < 0 || x > window.innerWidth) continue;
    const stack = document.elementsFromPoint(x, refY);
    for (const el of stack) {
      if (!(el instanceof Element)) continue;
      if (!root.contains(el)) continue;
      const fig = el.closest(".project-figure");
      if (!fig || !root.contains(fig)) continue;
      const id = sectionIdFromFigure(fig, idSet);
      if (id) return id;
    }
  }

  return null;
}

/**
 * Every top-level figure in the desktop image column, tagged with its section id.
 * Compositions are one `.project-figure`; stacked singles each contribute a hit.
 */
function collectDrawingHits(sectionIds: string[]): DrawingHit[] {
  const hits: DrawingHit[] = [];
  const idSet = new Set(sectionIds);

  for (const id of sectionIds) {
    const section = desktopSectionEl(id);
    if (!section) continue;

    const figs = section.querySelectorAll<HTMLElement>(
      ":scope .project-image-column > .project-figure"
    );
    if (figs.length === 0) {
      const r = section.getBoundingClientRect();
      if (r.height > 1) hits.push({ id, top: r.top, bottom: r.bottom });
      continue;
    }

    figs.forEach((fig) => {
      const r = fig.getBoundingClientRect();
      if (r.height > 1) hits.push({ id, top: r.top, bottom: r.bottom });
    });
  }

  if (!hits.length) {
    const root = desktopRoot();
    root?.querySelectorAll<HTMLElement>("[data-drawing-anchor]").forEach((el) => {
      const id = el.getAttribute("data-drawing-anchor");
      if (!id || !idSet.has(id)) return;
      const r = el.getBoundingClientRect();
      if (r.height > 1) hits.push({ id, top: r.top, bottom: r.bottom });
    });
  }

  return hits;
}

/**
 * Active drawing title at the content-top line.
 *
 * Primary: `elementsFromPoint` under `--site-content-top` in the image column
 * (what you are looking at). Fallback: figure whose vertical span contains the
 * line, else the last figure whose top has passed it.
 */
export function activeSectionByTop(
  sectionIds: string[],
  refY: number = scrollReferenceY()
): string {
  if (!sectionIds.length) return "";

  const fromHit = activeSectionByHitTest(sectionIds, refY);
  if (fromHit) return fromHit;

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

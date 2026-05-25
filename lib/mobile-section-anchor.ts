import { mobileGridConstants } from "@/lib/mobile-grid";

/** Scroll a project section into view below the sticky mobile header + nav. */
export function scrollToMobileSection(sectionId: string): void {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const refY = mobileGridConstants().scrollReferenceY;
  const anchor =
    section.querySelector<HTMLElement>(".mobile-section-label") ??
    section.querySelector<HTMLElement>(".project-figure") ??
    section;

  const topDoc = anchor.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: topDoc - refY,
    behavior: "smooth",
  });
}

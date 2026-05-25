import mobileSite from "@/content/grid/mobile-site.json";

export type MobileGridConstants = typeof mobileSite.constants & {
  gridSubunit: number;
  contentWidth: number;
  scrollReferenceY: number;
};

export function mobileGridConstants(): MobileGridConstants {
  const c = mobileSite.constants;
  const gridSubunit = c.gridUnit / c.gridSubdivision;
  const contentWidth = mobileSite.refWidth - c.marginX * 2;
  const scrollReferenceY = c.headerHeight + c.navHeight + 12;
  return {
    ...c,
    gridSubunit,
    contentWidth,
    scrollReferenceY,
  };
}

export const MOBILE_BREAKPOINT_PX = 767;

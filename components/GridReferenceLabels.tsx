"use client";

import { useEffect, useState } from "react";
import siteGrid from "@/content/grid/site.json";
import {
  gridColumnLabels,
  gridRowLabels,
  type GridConstants,
} from "@/content/grid/registry";

const REF_WIDTH = siteGrid.refWidth;
const MAX_ROW_Y = 20000;

function refYToViewportPx(yRef: number): number {
  return (yRef * window.innerWidth) / REF_WIDTH;
}

type VisibleRow = { label: string; top: number };

function visibleRowLabels(c: GridConstants, scrollY: number): VisibleRow[] {
  const rows = gridRowLabels(c, MAX_ROW_Y);
  const vh = window.innerHeight;
  const pad = 24;
  const out: VisibleRow[] = [];

  for (const row of rows) {
    const docTop = refYToViewportPx(row.pos);
    const viewportTop = docTop - scrollY;
    if (viewportTop < -pad || viewportTop > vh + pad) continue;
    out.push({ label: row.label, top: viewportTop });
  }

  return out;
}

/** Column letters + scroll-synced row numbers for grid reference. */
export default function GridReferenceLabels() {
  const c = siteGrid.constants as GridConstants;
  const columns = gridColumnLabels(c);
  const [rows, setRows] = useState<VisibleRow[]>([]);

  useEffect(() => {
    const update = () => {
      setRows(visibleRowLabels(c, window.scrollY));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [c]);

  return (
    <>
      {columns.map(({ pos, label }) => (
        <span
          key={`col-${label}`}
          className="layout-grid-label layout-grid-label--col"
          style={{ left: `calc(100vw * ${pos} / var(--ref-width))` }}
        >
          {label}
        </span>
      ))}
      {rows.map(({ label, top }) => (
        <span
          key={`row-${label}-${Math.round(top)}`}
          className="layout-grid-label layout-grid-label--row"
          style={{ top: `${top}px` }}
        >
          {label}
        </span>
      ))}
    </>
  );
}

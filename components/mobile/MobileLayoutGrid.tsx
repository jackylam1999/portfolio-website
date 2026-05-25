"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { mobileGridConstants } from "@/lib/mobile-grid";

const GRID_BOOT = `(function(){try{var p=new URLSearchParams(location.search);if(p.get("grid")==="1"){document.documentElement.setAttribute("data-mobile-grid","1");}else{document.documentElement.removeAttribute("data-mobile-grid");}}catch(e){}})();`;

/** Dev alignment grid — visible on mobile when ?grid=1 (hidden in publish). */
export default function MobileLayoutGrid() {
  const searchParams = useSearchParams();
  const show = searchParams.get("grid") === "1";
  const c = mobileGridConstants();
  const sub = c.gridSubunit;
  const majors = Math.ceil(3000 / c.gridUnit) + 1;

  useEffect(() => {
    if (show) {
      document.documentElement.setAttribute("data-mobile-grid", "1");
    } else {
      document.documentElement.removeAttribute("data-mobile-grid");
    }
    return () => document.documentElement.removeAttribute("data-mobile-grid");
  }, [show]);

  if (!show) {
    return <script dangerouslySetInnerHTML={{ __html: GRID_BOOT }} />;
  }

  const hLines = Array.from({ length: majors * c.gridSubdivision + 1 }, (_, i) => i * sub);
  const vLines = Array.from(
    { length: Math.ceil((c.contentWidth + c.marginX * 2) / sub) + 1 },
    (_, i) => i * sub
  );

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GRID_BOOT }} />
      <div className="mobile-layout-grid" aria-hidden>
        {hLines.map((y) => (
          <div
            key={`h-${y}`}
            className={
              "mobile-layout-grid__line mobile-layout-grid__line--h" +
              (y % c.gridUnit === 0 ? " mobile-layout-grid__line--major" : "")
            }
            style={{ top: y }}
          />
        ))}
        {vLines.map((x) => (
          <div
            key={`v-${x}`}
            className={
              "mobile-layout-grid__line mobile-layout-grid__line--v" +
              (x % c.gridUnit === 0 ? " mobile-layout-grid__line--major" : "")
            }
            style={{ left: x }}
          />
        ))}
      </div>
    </>
  );
}

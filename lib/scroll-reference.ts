/** Read a resolved CSS length custom property (px) from the document root. */
export function readCssLengthPx(varName: string): number {
  if (typeof document === "undefined") return 0;
  const probe = document.createElement("div");
  probe.style.cssText = `position:absolute;top:0;left:0;height:var(${varName});width:0;visibility:hidden;pointer-events:none`;
  document.body.appendChild(probe);
  const px = probe.getBoundingClientRect().height;
  probe.remove();
  return px;
}

/** Viewport y of the bottom purple content reference line (--site-content-top). */
export function scrollReferenceY(): number {
  if (typeof window === "undefined") return 312;
  return readCssLengthPx("--site-content-top");
}

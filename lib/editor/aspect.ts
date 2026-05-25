/** Parse CSS aspect-ratio string e.g. "1600 / 1200" → height for a given width (ref px). */
export function heightForWidthRef(w: number, aspectRatio: string): number {
  const parts = aspectRatio.split("/").map((s) => parseFloat(s.trim()));
  const aw = parts[0] || 1;
  const ah = parts[1] || 1;
  return w * (ah / aw);
}

/** Uniform scale factor from corner drag deltas (ref px). */
export function scaleFromCornerDrag(
  startW: number,
  startH: number,
  dxRef: number,
  dyRef: number,
  corner: "tl" | "tr" | "bl" | "br"
): number {
  const scaleX =
    corner === "br" || corner === "tr"
      ? (startW + dxRef) / startW
      : (startW - dxRef) / startW;
  const scaleY =
    corner === "br" || corner === "bl"
      ? (startH + dyRef) / startH
      : (startH - dyRef) / startH;
  const scale = (scaleX + scaleY) / 2;
  return Math.max(0.05, scale);
}

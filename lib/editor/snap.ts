import type { GridConstants } from "@/content/grid/registry";
import { gridSubunit, imageAreaRightRef } from "@/content/grid/registry";

/** Snap a horizontal value (2560 ref px) to the nearest grid subunit. */
export function snapToGridX(
  value: number,
  c: GridConstants,
  origin = c.imageAreaLeft
): number {
  const sub = gridSubunit(c);
  const offset = value - origin;
  const snapped = Math.round(offset / sub) * sub;
  return origin + snapped;
}

/** Snap a vertical offset (2560 ref px) to the nearest grid subunit. */
export function snapToGridY(value: number, c: GridConstants): number {
  const sub = gridSubunit(c);
  return Math.round(value / sub) * sub;
}

/** @deprecated Use snapToGridX */
export function snapToGrid(
  value: number,
  c: GridConstants,
  origin = c.imageAreaLeft
): number {
  return snapToGridX(value, c, origin);
}

/** Clamp left/width to the image area boundaries. */
export function clampLayout(
  x: number,
  w: number,
  c: GridConstants
): { x: number; w: number } {
  const left = c.imageAreaLeft;
  const right = imageAreaRightRef(c);
  const minW = 80;
  const maxW = c.imageAreaWidth;
  const cw = Math.max(minW, Math.min(w, maxW));
  const cx = Math.max(left, Math.min(x, right - cw));
  return { x: cx, w: cw };
}

/** Clamp vertical offset — allow moving up slightly within a section. */
export function clampMarginTop(marginTop: number): number {
  return Math.max(-300, Math.min(marginTop, 8000));
}

/** Convert client viewport pixels to ref-canvas (2560) pixels. */
export function clientToRef(clientPx: number, viewportWidth: number): number {
  if (viewportWidth <= 0) return clientPx;
  return (clientPx * 2560) / viewportWidth;
}

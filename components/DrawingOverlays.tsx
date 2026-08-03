"use client";

import type { DrawingOverlays } from "@/content/types";

function refCss(ref: number): string {
  const floored = Math.round(Math.abs(ref) * 0.42);
  const lo = Math.min(floored, Math.abs(ref));
  const hi = Math.max(floored, Math.abs(ref));
  const sign = ref < 0 ? -1 : 1;
  if (sign < 0) {
    return `clamp(${-hi}px, calc(100vw * ${ref} / var(--ref-width)), ${-lo}px)`;
  }
  return `clamp(${lo}px, calc(100vw * ${ref} / var(--ref-width)), ${hi}px)`;
}

function fontCss(ref: number): string {
  // Match site type scale: ~13.5px at 1440 → scale overlay sizes the same way.
  const mac = 13.5;
  const ratio = ref / mac;
  return `calc(var(--font-site) * ${ratio})`;
}

interface Props {
  overlays: DrawingOverlays;
  /** Composition / figure frame size on the 2560 canvas (for % positioning). */
  frameW: number;
  frameH: number;
}

/**
 * Absolutely positioned text + SVG lines over a drawing frame.
 * Coordinates are 2560-ref px relative to the frame origin (may be negative).
 */
export default function DrawingOverlaysLayer({
  overlays,
  frameW,
  frameH,
}: Props) {
  const texts = overlays.texts ?? [];
  const lines = overlays.lines ?? [];
  if (!texts.length && !lines.length) return null;

  const minX = Math.min(0, ...texts.map((t) => t.xRef), ...lines.flatMap((l) => [l.x1Ref, l.x2Ref]));
  const minY = Math.min(0, ...texts.map((t) => t.yRef), ...lines.flatMap((l) => [l.y1Ref, l.y2Ref]));
  const maxX = Math.max(
    frameW,
    ...texts.map((t) => t.xRef + (t.maxWidthRef ?? 220)),
    ...lines.flatMap((l) => [l.x1Ref, l.x2Ref])
  );
  const maxY = Math.max(
    frameH,
    ...texts.map((t) => t.yRef + (t.fontSizeRef ?? 12) * 1.4),
    ...lines.flatMap((l) => [l.y1Ref, l.y2Ref])
  );

  const layerW = maxX - minX;
  const layerH = maxY - minY;

  return (
    <div
      className="drawing-overlays pointer-events-none absolute"
      aria-hidden
      style={{
        left: refCss(minX),
        top: refCss(minY),
        width: refCss(layerW),
        height: refCss(layerH),
        overflow: "visible",
      }}
    >
      {lines.length > 0 ? (
        <svg
          className="absolute inset-0 h-full w-full overflow-visible"
          viewBox={`${minX} ${minY} ${layerW} ${layerH}`}
          preserveAspectRatio="none"
        >
          {lines.map((line) => (
            <line
              key={line.id}
              x1={line.x1Ref}
              y1={line.y1Ref}
              x2={line.x2Ref}
              y2={line.y2Ref}
              stroke={line.color ?? "#111"}
              strokeWidth={line.strokeRef ?? 1}
              strokeDasharray={line.style === "dashed" ? "4 3" : undefined}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      ) : null}

      {texts.map((t) => (
        <div
          key={t.id}
          className="absolute whitespace-pre-wrap"
          style={{
            left: refCss(t.xRef - minX),
            top: refCss(t.yRef - minY),
            maxWidth: t.maxWidthRef != null ? refCss(t.maxWidthRef) : refCss(240),
            fontSize: fontCss(t.fontSizeRef ?? (t.role === "gutter-title" ? 14 : 11)),
            lineHeight: 1.35,
            textAlign: t.align ?? "left",
            color: t.color ?? "#111",
            fontFamily: "Georgia, 'Times New Roman', Times, serif",
          }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}

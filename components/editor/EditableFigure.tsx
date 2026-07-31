"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProjectImage } from "@/content/types";
import { heightForWidthRef, scaleFromCornerDrag } from "@/lib/editor/aspect";
import { imageSizesAttr } from "@/lib/image-layout";
import {
  clampLayout,
  clampMarginTop,
  clientToRef,
  snapToGridX,
  snapToGridY,
} from "@/lib/editor/snap";
import { isEditableTarget } from "@/lib/editor/keyboard";
import { useEditor } from "./EditorProvider";
import { useProjectGrid } from "@/components/ProjectGridProvider";

interface Props {
  slug: string;
  sectionId: string;
  img: ProjectImage;
  priority?: boolean;
}

type DragMode =
  | "move"
  | "resize-left"
  | "resize-right"
  | "resize-tl"
  | "resize-tr"
  | "resize-bl"
  | "resize-br";

interface DragState {
  mode: DragMode;
  startClientX: number;
  startClientY: number;
  startRefX: number;
  startRefW: number;
  startRefY: number;
  startRefH: number;
  aspectRatio: string;
  viewportWidth: number;
}

function refCss(refPx: number): string {
  const floored = Math.round(refPx * 0.42);
  const lo = Math.min(floored, refPx);
  const hi = Math.max(floored, refPx);
  return `clamp(${lo}px, calc(100vw * ${refPx} / var(--ref-width)), ${hi}px)`;
}

function isCornerMode(mode: DragMode): boolean {
  return mode.startsWith("resize-") && mode !== "resize-left" && mode !== "resize-right";
}

export default function EditableFigure({ slug, sectionId, img, priority }: Props) {
  const editor = useEditor();
  const grid = useProjectGrid(slug);
  const {
    constants,
    snapEnabled,
    selectedKey,
    setSelectedKey,
    setImageEdit,
    resolveLayout,
    pushUndoSnapshot,
  } = editor;

  const layout = resolveLayout(sectionId, img);
  const isSelected = selectedKey === sectionId;

  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const layoutRef = useRef(layout);

  layoutRef.current = layout;
  dragRef.current = drag;

  const applyDrag = useCallback(
    (clientX: number, clientY: number) => {
      const active = dragRef.current;
      if (!active) return;

      const dxRef = clientToRef(clientX - active.startClientX, active.viewportWidth);
      const dyRef = clientToRef(clientY - active.startClientY, active.viewportWidth);

      let nextX = active.startRefX;
      let nextW = active.startRefW;
      let nextY = active.startRefY;

      if (active.mode === "move") {
        nextX = active.startRefX + dxRef;
        nextY = active.startRefY + dyRef;
      } else if (active.mode === "resize-right") {
        nextW = active.startRefW + dxRef;
      } else if (active.mode === "resize-left") {
        nextX = active.startRefX + dxRef;
        nextW = active.startRefW - dxRef;
      } else if (isCornerMode(active.mode)) {
        const corner = active.mode.replace("resize-", "") as "tl" | "tr" | "bl" | "br";
        const scale = scaleFromCornerDrag(
          active.startRefW,
          active.startRefH,
          dxRef,
          dyRef,
          corner
        );
        nextW = active.startRefW * scale;

        const anchorRight = active.startRefX + active.startRefW;
        const anchorBottom = active.startRefY + active.startRefH;

        if (corner === "br") {
          nextX = active.startRefX;
          nextY = active.startRefY;
        } else if (corner === "bl") {
          nextX = anchorRight - nextW;
          nextY = active.startRefY;
        } else if (corner === "tr") {
          nextX = active.startRefX;
          const nextH = heightForWidthRef(nextW, active.aspectRatio);
          nextY = anchorBottom - nextH;
        } else {
          nextX = anchorRight - nextW;
          const nextH = heightForWidthRef(nextW, active.aspectRatio);
          nextY = anchorBottom - nextH;
        }
      }

      if (snapEnabled) {
        if (active.mode === "move") {
          nextX = snapToGridX(nextX, constants);
          nextY = snapToGridY(nextY, constants);
        } else if (active.mode === "resize-right") {
          const right = snapToGridX(nextX + nextW, constants);
          nextW = right - nextX;
        } else if (active.mode === "resize-left") {
          const right = active.startRefX + active.startRefW;
          nextX = snapToGridX(nextX, constants);
          nextW = right - nextX;
        } else if (isCornerMode(active.mode)) {
          nextW = Math.max(80, snapToGridX(nextX + nextW, constants) - snapToGridX(nextX, constants));
          const corner = active.mode.replace("resize-", "") as "tl" | "tr" | "bl" | "br";
          const anchorRight = active.startRefX + active.startRefW;
          const anchorBottom = active.startRefY + active.startRefH;
          if (corner === "bl" || corner === "tl") {
            nextX = anchorRight - nextW;
          }
          if (corner === "tr" || corner === "tl") {
            nextY = anchorBottom - heightForWidthRef(nextW, active.aspectRatio);
            nextY = snapToGridY(nextY, constants);
          }
        }
      }

      const clamped = clampLayout(nextX, nextW, constants);
      setImageEdit(sectionId, {
        x: Math.round(clamped.x),
        w: Math.round(clamped.w),
        marginTop: Math.round(clampMarginTop(nextY)),
      });
    },
    [constants, sectionId, setImageEdit, snapEnabled]
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
    setDrag(null);
    document.body.classList.remove("editor-dragging");
    document.body.removeAttribute("data-editor-drag-mode");
  }, []);

  useEffect(() => {
    if (!drag) return;

    const onMove = (e: PointerEvent) => applyDrag(e.clientX, e.clientY);
    const onUp = () => endDrag();

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [drag, applyDrag, endDrag]);

  const onPointerDown = useCallback(
    (mode: DragMode) => (e: React.PointerEvent) => {
      if (!editor.enabled) return;
      e.preventDefault();
      e.stopPropagation();
      pushUndoSnapshot();
      setSelectedKey(sectionId);
      document.body.classList.add("editor-dragging");
      document.body.setAttribute("data-editor-drag-mode", mode);

      const cur = layoutRef.current;
      const startRefH = heightForWidthRef(cur.w, cur.aspectRatio);

      const next: DragState = {
        mode,
        startClientX: e.clientX,
        startClientY: e.clientY,
        startRefX: cur.x,
        startRefW: cur.w,
        startRefY: cur.marginTop,
        startRefH,
        aspectRatio: cur.aspectRatio,
        viewportWidth: window.innerWidth,
      };
      dragRef.current = next;
      setDrag(next);
    },
    [editor.enabled, sectionId, setSelectedKey, pushUndoSnapshot]
  );

  useEffect(() => {
    if (!isSelected || !editor.enabled) return;
    function onKey(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey) return;
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
      e.preventDefault();
      pushUndoSnapshot();
      const step = e.shiftKey ? constants.gridUnit : constants.gridUnit / 2;
      const cur = layoutRef.current;
      let nextX = cur.x;
      const nextW = cur.w;
      let nextY = cur.marginTop;

      if (e.key === "ArrowLeft") nextX -= step;
      else if (e.key === "ArrowRight") nextX += step;
      else if (e.key === "ArrowUp") nextY -= step;
      else if (e.key === "ArrowDown") nextY += step;

      if (snapEnabled) {
        nextX = snapToGridX(nextX, constants);
        nextY = snapToGridY(nextY, constants);
      }

      const clamped = clampLayout(nextX, nextW, constants);
      setImageEdit(sectionId, {
        x: Math.round(clamped.x),
        w: Math.round(clamped.w),
        marginTop: Math.round(clampMarginTop(nextY)),
      });
    }
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [
    isSelected,
    editor.enabled,
    constants,
    snapEnabled,
    setImageEdit,
    sectionId,
    pushUndoSnapshot,
  ]);

  const w = img.naturalWidth ?? 1600;
  const h = img.naturalHeight ?? 1200;
  const preOptimized = img.src.endsWith(".webp");

  return (
    <figure
      className={`project-figure editable-figure m-0 flex shrink-0 flex-col items-start ${
        isSelected ? "editable-figure--selected" : ""
      }`}
      style={{
        width: refCss(layout.w),
        marginLeft: refCss(layout.marginLeft),
        marginTop:
          priority || !layout.marginTop ? undefined : refCss(layout.marginTop),
        maxWidth: "100%",
        aspectRatio: layout.aspectRatio,
        position: "relative",
      }}
      data-section-id={sectionId}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedKey(sectionId);
      }}
    >
      <Image
        src={img.src}
        alt={img.alt}
        width={w}
        height={h}
        sizes={imageSizesAttr(slug, sectionId, img, grid)}
        quality={88}
        priority={priority}
        unoptimized={preOptimized}
        draggable={false}
        className="block h-full w-full object-contain object-left-top select-none pointer-events-none"
      />

      <div
        className="editable-figure__move"
        onPointerDown={onPointerDown("move")}
        title="Drag to move · arrow keys for fine adjustments"
      />

      {isSelected ? (
        <>
          <div
            className="editable-figure__handle editable-figure__handle--left"
            onPointerDown={onPointerDown("resize-left")}
            title="Drag to resize from the left"
          />
          <div
            className="editable-figure__handle editable-figure__handle--right"
            onPointerDown={onPointerDown("resize-right")}
            title="Drag to resize from the right"
          />
          <div
            className="editable-figure__corner editable-figure__corner--tl"
            onPointerDown={onPointerDown("resize-tl")}
            title="Drag corner to scale"
          />
          <div
            className="editable-figure__corner editable-figure__corner--tr"
            onPointerDown={onPointerDown("resize-tr")}
            title="Drag corner to scale"
          />
          <div
            className="editable-figure__corner editable-figure__corner--bl"
            onPointerDown={onPointerDown("resize-bl")}
            title="Drag corner to scale"
          />
          <div
            className="editable-figure__corner editable-figure__corner--br"
            onPointerDown={onPointerDown("resize-br")}
            title="Drag corner to scale"
          />
          <div className="editable-figure__readout">
            x {Math.round(layout.x)} · y {Math.round(layout.marginTop)} · w{" "}
            {Math.round(layout.w)}
          </div>
        </>
      ) : null}

      {img.caption ? (
        <figcaption className="type-caption text-black/70">{img.caption}</figcaption>
      ) : null}
    </figure>
  );
}

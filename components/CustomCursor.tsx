"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  hideNativeCursor,
  hideNativeCursorAfterClick,
  hideNativeCursorOnElement,
  showNativeCursor,
} from "@/lib/cursor";

/**
 * Custom cursor — hollow black ring by default, solid accent disc on hover.
 * Native cursor is suppressed continuously because clicks / route changes
 * (e.g. home thumbnails) reset styles without a mousemove.
 */
export default function CustomCursor() {
  const pathname = usePathname();
  const dotRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const sync = () =>
      setEditMode(document.documentElement.hasAttribute("data-editor"));
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-editor"],
    });
    return () => obs.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (editMode) {
      showNativeCursor();
    }
  }, [editMode]);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const setActive = (active: boolean) => {
      setEnabled(active);
      if (active) hideNativeCursor();
      else showNativeCursor();
    };
    setActive(mq.matches);
    const handler = (e: MediaQueryListEvent) => setActive(e.matches);
    mq.addEventListener("change", handler);
    return () => {
      mq.removeEventListener("change", handler);
      showNativeCursor();
    };
  }, []);

  /* Re-apply after Next.js client navigations (home thumbnail clicks, nav links). */
  useEffect(() => {
    if (!enabled || editMode) return;
    hideNativeCursor();
    const el = document.elementFromPoint(pointerRef.current.x, pointerRef.current.y);
    hideNativeCursorOnElement(el);
    const timers = [0, 50, 150, 400, 800].map((ms) =>
      window.setTimeout(() => {
        hideNativeCursor();
        const under = document.elementFromPoint(
          pointerRef.current.x,
          pointerRef.current.y
        );
        hideNativeCursorOnElement(under);
      }, ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [pathname, enabled]);

  useEffect(() => {
    if (!enabled || editMode) return;
    const dot = dotRef.current;
    if (!dot) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    pointerRef.current = { x: targetX, y: targetY };
    dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
    dot.style.opacity = "1";

    let raf = 0;

    const tick = () => {
      raf = 0;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
    };

    const onPointer = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      pointerRef.current = { x: targetX, y: targetY };
      hideNativeCursorOnElement(e.target as Element);
      hideNativeCursor();
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const isInteractive = (el: Element | null): boolean =>
      Boolean(
        el?.closest(
          "a, button, [role='button'], .cursor-interactive, input, textarea, select, label"
        )
      );

    const onOver = (e: Event) => {
      hideNativeCursorOnElement(e.target as Element);
      hideNativeCursor();
      setHovering(isInteractive(e.target as Element));
    };

    const onFocusIn = (e: FocusEvent) => {
      hideNativeCursorOnElement(e.target as Element);
      hideNativeCursor();
    };

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as Element)?.closest("a");
      hideNativeCursorAfterClick(
        anchor instanceof HTMLElement ? anchor : null,
        pointerRef.current
      );
    };

    hideNativeCursor();

    const capture = { capture: true, passive: true } as const;
    window.addEventListener("pointermove", onPointer, capture);
    window.addEventListener("pointerdown", onPointer, capture);
    window.addEventListener("pointerup", onPointer, capture);
    window.addEventListener("pointerover", onOver, capture);
    window.addEventListener("mouseover", onOver, capture);
    window.addEventListener("click", onClick, { capture: true, passive: true });
    window.addEventListener("focusin", onFocusIn, capture);

    return () => {
      window.removeEventListener("pointermove", onPointer, capture);
      window.removeEventListener("pointerdown", onPointer, capture);
      window.removeEventListener("pointerup", onPointer, capture);
      window.removeEventListener("pointerover", onOver, capture);
      window.removeEventListener("mouseover", onOver, capture);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("focusin", onFocusIn, capture);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [enabled, editMode]);

  if (!enabled || editMode) return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{
        opacity: 0,
        transform: "translate3d(-100px, -100px, 0) translate(-50%, -50%)",
      }}
    >
      <div
        className="rounded-full"
        style={{
          width: "var(--cursor-size)",
          height: "var(--cursor-size)",
          boxSizing: "border-box",
          border: hovering ? "none" : "var(--cursor-border) solid #000",
          backgroundColor: hovering ? "var(--color-accent)" : "transparent",
          transition: "background-color 150ms ease",
        }}
      />
    </div>
  );
}

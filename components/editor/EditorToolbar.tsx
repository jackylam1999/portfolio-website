"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEditor } from "./EditorProvider";

const STATUS_COPY = {
  idle: "Ready",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
} as const;

export default function EditorToolbar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    enabled,
    mode,
    snapEnabled,
    setSnapEnabled,
    gridVisible,
    setGridVisible,
    isDirty,
    discard,
    save,
    status,
    message,
    imageEdits,
    textEdits,
    undo,
    redo,
    canUndo,
    canRedo,
    pageBottomRef,
    adjustPageBottom,
    constants,
  } = useEditor();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (enabled) {
      document.documentElement.setAttribute("data-editor", "1");
      document.documentElement.setAttribute("data-editor-mode", mode);
    } else {
      document.documentElement.removeAttribute("data-editor");
      document.documentElement.removeAttribute("data-editor-mode");
    }
    return () => {
      document.documentElement.removeAttribute("data-editor");
      document.documentElement.removeAttribute("data-editor-mode");
    };
  }, [enabled, mode]);

  useEffect(() => {
    if (typeof document === "undefined" || !enabled) return;
    document.documentElement.setAttribute(
      "data-layout-grid",
      gridVisible ? "1" : "0"
    );
  }, [enabled, gridVisible]);

  if (!enabled) return null;

  const isSiteMode = mode === "site";
  const editCount =
    Object.keys(imageEdits).length + Object.keys(textEdits).length;

  const pageMinReached = pageBottomRef <= constants.gridUnit;

  const previewHref = (() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("edit");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  })();

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Editor controls">
      <div className="editor-toolbar__head">
        <span className="editor-toolbar__badge">Edit</span>
        <span
          className={`editor-toolbar__status editor-toolbar__status--${status}`}
          aria-live="polite"
        >
          {isSiteMode ? "Grid overlay" : STATUS_COPY[status]}
          {!isSiteMode && editCount
            ? ` · ${editCount} change${editCount === 1 ? "" : "s"}`
            : ""}
          {message ? ` · ${message}` : ""}
        </span>
      </div>

      <label className="editor-toolbar__check">
        <input
          type="checkbox"
          checked={gridVisible}
          onChange={(e) => setGridVisible(e.target.checked)}
        />
        Show grid
      </label>

      {!isSiteMode ? (
        <>
          <label className="editor-toolbar__check">
            <input
              type="checkbox"
              checked={snapEnabled}
              onChange={(e) => setSnapEnabled(e.target.checked)}
            />
            Snap to grid
          </label>

          <div className="editor-toolbar__actions editor-toolbar__actions--row">
            <button
              type="button"
              className="editor-toolbar__btn editor-toolbar__btn--compact"
              onClick={undo}
              disabled={!canUndo || status === "saving"}
              title="Undo (⌘Z / Ctrl+Z)"
            >
              Undo
            </button>
            <button
              type="button"
              className="editor-toolbar__btn editor-toolbar__btn--compact"
              onClick={redo}
              disabled={!canRedo || status === "saving"}
              title="Redo (⌘⇧Z / Ctrl+Y)"
            >
              Redo
            </button>
          </div>

          <div className="editor-toolbar__actions">
            <button
              type="button"
              className="editor-toolbar__btn editor-toolbar__btn--primary"
              onClick={() => void save()}
              disabled={!isDirty || status === "saving"}
              title="Save (⌘S / Ctrl+S)"
            >
              {status === "saving" ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="editor-toolbar__btn"
              onClick={discard}
              disabled={!isDirty || status === "saving"}
            >
              Discard
            </button>
          </div>

          <div
            className="editor-toolbar__page-length"
            role="group"
            aria-label="Page length"
          >
            <span className="editor-toolbar__page-length-label">Page length</span>
            <button
              type="button"
              className="editor-toolbar__btn editor-toolbar__btn--compact"
              aria-label="Reduce page length"
              disabled={pageMinReached || status === "saving"}
              onClick={() => adjustPageBottom(-constants.gridUnit)}
              title="Remove one grid row from page bottom"
            >
              −
            </button>
            <button
              type="button"
              className="editor-toolbar__btn editor-toolbar__btn--compact"
              aria-label="Add page length"
              disabled={status === "saving"}
              onClick={() => adjustPageBottom(constants.gridUnit)}
              title="Add one grid row to page bottom"
            >
              +
            </button>
          </div>
        </>
      ) : null}

      <div className="editor-toolbar__footer">
        <a className="editor-toolbar__link" href={previewHref}>
          Preview
        </a>
        <span className="editor-toolbar__sep" aria-hidden>
          ·
        </span>
        <a className="editor-toolbar__link" href={previewHref}>
          Exit
        </a>
      </div>
    </div>
  );
}

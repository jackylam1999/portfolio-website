/**
 * Chrome requires cursor images ≥32×32 — smaller images are ignored and the
 * native pointer shows. Prefer a same-origin PNG (stable after navigation).
 */
const CURSOR_PNG_DATA =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYSURBVHhe7cEBAQAAAIIg/69uSEABAAAAAElFTkSuQmCC";

export const CURSOR_BLANK_URL = "/cursors/blank-32.png";

export const CURSOR_HIDDEN = `url("${CURSOR_BLANK_URL}") 16 16, url("${CURSOR_PNG_DATA}") 16 16, none`;

const STYLE_ID = "native-cursor-hide";

export function injectCursorHideStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
html.custom-cursor,
html.custom-cursor *,
html.custom-cursor *::before,
html.custom-cursor *::after {
  cursor: ${CURSOR_HIDDEN} !important;
}
html.custom-cursor a:focus,
html.custom-cursor a:active,
html.custom-cursor a:focus-visible,
html.custom-cursor button:focus,
html.custom-cursor button:active,
html.custom-cursor *:focus,
html.custom-cursor *:active {
  cursor: ${CURSOR_HIDDEN} !important;
}
html.custom-cursor a,
html.custom-cursor .cursor-interactive,
html.custom-cursor button {
  user-select: none;
  -webkit-user-select: none;
}
html.custom-cursor img,
html.custom-cursor a,
html.custom-cursor button {
  -webkit-user-drag: none;
}
`.trim();
  (document.head || document.documentElement).appendChild(style);
}

export function hideNativeCursor() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.add("custom-cursor");
  injectCursorHideStyles();
  document.documentElement.style.setProperty("cursor", CURSOR_HIDDEN, "important");
  if (document.body) {
    document.body.style.setProperty("cursor", CURSOR_HIDDEN, "important");
  }
}

export function hideNativeCursorOnElement(el: Element | null) {
  if (!(el instanceof HTMLElement)) return;
  el.style.setProperty("cursor", CURSOR_HIDDEN, "important");
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.style.setProperty("cursor", CURSOR_HIDDEN, "important");
  }
}

/** Chrome shows the text/I-beam cursor on focused link text — clear after clicks. */
export function clearCursorFocusState(anchor?: HTMLElement | null) {
  window.getSelection()?.removeAllRanges();
  anchor?.blur();
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

export function hideNativeCursorAfterClick(
  anchor?: HTMLElement | null,
  pointer?: { x: number; y: number }
) {
  hideNativeCursor();
  hideNativeCursorOnElement(anchor ?? null);
  window.getSelection()?.removeAllRanges();

  const applyAtPointer = () => {
    hideNativeCursor();
    if (pointer) {
      hideNativeCursorOnElement(document.elementFromPoint(pointer.x, pointer.y));
    }
  };

  applyAtPointer();
  [16, 50, 100, 200, 400, 800].forEach((ms) => {
    window.setTimeout(applyAtPointer, ms);
  });

  /* Defer blur until after Next.js Link navigation has started. */
  window.setTimeout(() => clearCursorFocusState(anchor), 150);
}

export function showNativeCursor() {
  if (typeof document === "undefined") return;
  document.documentElement.classList.remove("custom-cursor");
  document.documentElement.style.removeProperty("cursor");
  if (document.body) {
    document.body.style.removeProperty("cursor");
  }
  document.getElementById(STYLE_ID)?.remove();
}

export function isCustomCursorEnabled() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Runs in <head> before React — Chrome-safe cursor + injected stylesheet. */
export const CURSOR_BOOT_SCRIPT = `(function(){try{var h="url(\\"/cursors/blank-32.png\\") 16 16, none";if(!window.matchMedia("(hover:hover) and (pointer:fine)").matches)return;var r=document.documentElement;r.classList.add("custom-cursor");r.style.setProperty("cursor",h,"important");if(document.body)document.body.style.setProperty("cursor",h,"important");if(!document.getElementById("native-cursor-hide")){var s=document.createElement("style");s.id="native-cursor-hide";s.textContent="html.custom-cursor,html.custom-cursor *,html.custom-cursor *::before,html.custom-cursor *::after{cursor:"+h+"!important}html.custom-cursor a:focus,html.custom-cursor a:active,html.custom-cursor a:focus-visible{cursor:"+h+"!important}html.custom-cursor a,html.custom-cursor .cursor-interactive,html.custom-cursor button{user-select:none;-webkit-user-select:none}";(document.head||r).appendChild(s)}}catch(e){}})();`;

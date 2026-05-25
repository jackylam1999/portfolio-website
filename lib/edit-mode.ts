/** True when URL has ?edit=1 or ?edit=true (explicit ?edit=0 disables). */
export function isEditMode(
  searchParams: URLSearchParams | { edit?: string | null }
): boolean {
  const edit =
    searchParams instanceof URLSearchParams
      ? searchParams.get("edit")
      : searchParams.edit;
  if (edit === "0") return false;
  return edit === "1" || edit === "true";
}

/** Append ?edit=1 (or &edit=1) so editor stays on while navigating. */
export function withEditParam(href: string): string {
  if (href.startsWith("http") || href.startsWith("mailto:")) return href;
  const hashIdx = href.indexOf("#");
  const hash = hashIdx >= 0 ? href.slice(hashIdx) : "";
  const base = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
  const qIdx = base.indexOf("?");
  const path = qIdx >= 0 ? base.slice(0, qIdx) : base;
  const params = new URLSearchParams(qIdx >= 0 ? base.slice(qIdx + 1) : "");
  params.set("edit", "1");
  const qs = params.toString();
  return `${path}?${qs}${hash}`;
}

export const SET_EDITOR_SCRIPT = `(function(){try{document.documentElement.setAttribute("data-editor","1");document.documentElement.setAttribute("data-layout-grid","1");}catch(e){}})();`;

export const CLEAR_EDITOR_SCRIPT = `(function(){try{document.documentElement.removeAttribute("data-editor");document.documentElement.removeAttribute("data-layout-grid");}catch(e){}})();`;

"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import type { ProjectSection, ProjectSpecRow } from "@/content/types";
import { useActiveSectionId } from "@/hooks/useActiveSectionId";
import EditableSectionText from "@/components/editor/EditableSectionText";
import { useEditor } from "@/components/editor/EditorProvider";

interface Props {
  sections: ProjectSection[];
}

const FIT_MIN = 0.62;
const FIT_EPS = 0.008;

function formatSpecValue(label: string, value: string): string {
  if (label === "Collaborator") {
    return value
      .split("\n")
      .map((name) => name.trim())
      .filter(Boolean)
      .join(", ");
  }
  return value;
}

function StaticSectionTextContent({
  specs,
  text,
}: {
  specs?: ProjectSpecRow[];
  text?: string[];
}) {
  const hasSpecs = Boolean(specs?.length);
  const hasText = Boolean(text?.length);
  if (!hasSpecs && !hasText) return null;

  return (
    <>
      {hasSpecs ? (
        <dl
          className="flex flex-col"
          style={{
            gap: "calc(var(--font-base) * 0.35 * var(--section-text-fit, 1))",
            marginBottom: hasText
              ? "calc(var(--site-spec-gap) * var(--section-text-fit, 1))"
              : undefined,
          }}
        >
          {specs!.map((row) => (
            <div key={row.label} className="flex">
              <dt
                className="shrink-0 text-black"
                style={{ width: "var(--site-spec-label-width)" }}
              >
                {row.label}
              </dt>
              <dd
                className={
                  row.label === "Collaborator"
                    ? "text-black"
                    : "whitespace-pre-line text-black"
                }
              >
                {formatSpecValue(row.label, row.value)}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {hasText ? (
        <div
          className="project-section-description flex flex-col"
          style={{
            gap: "calc(var(--site-paragraph-gap) * var(--section-text-fit, 1))",
          }}
        >
          {text!.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
    </>
  );
}

function resolveDisplaySection(
  sections: ProjectSection[],
  activeId: string
): ProjectSection | null {
  const activeIndex = sections.findIndex((s) => s.id === activeId);
  if (activeIndex === -1) return null;

  const active = sections[activeIndex];
  if (active.specs?.length || active.text?.length) return active;

  /* Keep the nearest earlier block visible while scrolling image-only sections. */
  for (let i = activeIndex - 1; i >= 0; i--) {
    const s = sections[i];
    if (s.specs?.length || s.text?.length) return s;
  }
  return null;
}

/**
 * Shrink --section-text-fit until specs+description fit in the fixed aside
 * (one viewport, no nested scroll). Applies to every project.
 */
function useFitSectionText(
  asideRef: RefObject<HTMLElement | null>,
  contentKey: string,
  enabled: boolean
) {
  const fit = useCallback(() => {
    const aside = asideRef.current;
    if (!aside || !enabled) {
      aside?.style.setProperty("--section-text-fit", "1");
      return;
    }

    aside.style.setProperty("--section-text-fit", "1");
    // Force layout at full size before measuring.
    void aside.offsetHeight;
    const avail = aside.clientHeight;
    if (avail <= 0) return;

    if (aside.scrollHeight <= avail + 1) {
      aside.style.setProperty("--section-text-fit", "1");
      return;
    }

    let lo = FIT_MIN;
    let hi = 1;
    let best = FIT_MIN;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      aside.style.setProperty("--section-text-fit", String(mid));
      void aside.offsetHeight;
      if (aside.scrollHeight <= avail + 1) {
        best = mid;
        lo = mid;
      } else {
        hi = mid;
      }
      if (hi - lo < FIT_EPS) break;
    }
    aside.style.setProperty("--section-text-fit", String(best));
  }, [asideRef, enabled]);

  useLayoutEffect(() => {
    fit();
    const aside = asideRef.current;
    if (!aside || !enabled) return;

    const ro = new ResizeObserver(() => fit());
    ro.observe(aside);
    window.addEventListener("resize", fit);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", fit);
    };
    // contentKey forces re-fit when the active section copy changes
  }, [fit, asideRef, enabled, contentKey]);
}

function FitAside({
  contentKey,
  enabled,
  className,
  children,
}: {
  contentKey: string;
  enabled: boolean;
  className: string;
  children: ReactNode;
}) {
  const asideRef = useRef<HTMLElement>(null);
  useFitSectionText(asideRef, contentKey, enabled);

  return (
    <aside
      ref={asideRef}
      aria-label="Section description"
      aria-live="polite"
      className={className}
    >
      {children}
    </aside>
  );
}

/** Fixed left column — stays pinned; content swaps with the section in view. */
export default function FixedSectionText({ sections }: Props) {
  const activeId = useActiveSectionId(sections);
  const displaySection = resolveDisplaySection(sections, activeId);
  const editor = useEditor();

  if (!displaySection) return null;

  const inEditor = editor.enabled;
  const resolved = inEditor
    ? editor.resolveSectionContent(displaySection.id)
    : { text: displaySection.text, specs: displaySection.specs };

  const contentKey = [
    displaySection.id,
    resolved.specs?.map((s) => s.value).join("|") ?? "",
    resolved.text?.join("|") ?? "",
  ].join("::");

  return (
    <FitAside
      contentKey={contentKey}
      enabled={!inEditor}
      className={`site-fixed-section-text type-body text-left text-black ${
        inEditor ? "site-fixed-section-text--editing pointer-events-auto" : ""
      }`}
    >
      {inEditor ? (
        <EditableSectionText section={displaySection} />
      ) : (
        <StaticSectionTextContent specs={resolved.specs} text={resolved.text} />
      )}
    </FitAside>
  );
}

"use client";

import type { ProjectSection, ProjectSpecRow } from "@/content/types";
import { useActiveSectionId } from "@/hooks/useActiveSectionId";
import EditableSectionText from "@/components/editor/EditableSectionText";
import { useEditor } from "@/components/editor/EditorProvider";

interface Props {
  sections: ProjectSection[];
}

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
            gap: "calc(var(--font-base) * 0.35)",
            marginBottom: hasText ? "var(--site-spec-gap)" : undefined,
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
          style={{ gap: "var(--site-paragraph-gap)" }}
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

  return (
    <aside
      aria-label="Section description"
      aria-live="polite"
      className={`site-fixed-section-text type-body text-left text-black ${
        inEditor ? "site-fixed-section-text--editing pointer-events-auto" : ""
      }`}
    >
      {inEditor ? (
        <EditableSectionText section={displaySection} />
      ) : (
        <StaticSectionTextContent specs={resolved.specs} text={resolved.text} />
      )}
    </aside>
  );
}

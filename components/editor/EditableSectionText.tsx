"use client";

import type { ProjectSection } from "@/content/types";
import EditableText from "./EditableText";
import { useEditor } from "./EditorProvider";

interface Props {
  section: ProjectSection;
}

export default function EditableSectionText({ section }: Props) {
  const editor = useEditor();
  const resolved = editor.resolveSectionContent(section.id);
  const specs = resolved.specs ?? [];
  const text = resolved.text ?? [];
  const hasSpecs = specs.length > 0;
  const hasText = text.length > 0;

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
          {specs.map((row, index) => (
            <div key={`${row.label}-${index}`} className="flex">
              <dt
                className="shrink-0 text-black"
                style={{ width: "var(--site-spec-label-width)" }}
              >
                {row.label}
              </dt>
              <dd className="text-black">
                <EditableText
                  value={row.value}
                  multiline
                  label={`${row.label} value`}
                  onEditStart={editor.pushUndoSnapshot}
                  onChange={(next) =>
                    editor.setSectionSpec(section.id, index, { value: next })
                  }
                />
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
          {text.map((paragraph, i) => (
            <EditableText
              key={i}
              value={paragraph}
              multiline
              label={`Paragraph ${i + 1}`}
              onEditStart={editor.pushUndoSnapshot}
              onChange={(next) => {
                const nextText = [...text];
                nextText[i] = next;
                editor.setSectionText(section.id, nextText);
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  );
}

import type { ProjectSpecRow } from "@/content/types";

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

export default function MobileSectionText({
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
    <div className="mobile-section-text">
      {hasSpecs ? (
        <dl className="mobile-spec-list">
          {specs!.map((row) => (
            <div key={row.label} className="mobile-spec-row">
              <dt>{row.label}</dt>
              <dd>{formatSpecValue(row.label, row.value)}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {hasText ? (
        <div className="mobile-section-description">
          {text!.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

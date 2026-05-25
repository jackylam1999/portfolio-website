import SiteEditPageShell from "@/components/editor/SiteEditPageShell";
import { loadCvContent } from "@/lib/load-content.server";

export const dynamic = "force-dynamic";

export default function CvPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const cvSections = loadCvContent();

  return (
    <SiteEditPageShell searchParams={searchParams}>
      <div
        style={{
          paddingTop: "var(--site-top)",
          paddingBottom: "96px",
          paddingLeft: "var(--site-cv-content-left)",
          paddingRight: "var(--site-margin-x)",
        }}
      >
        <div
          className="flex flex-col"
          style={{
            maxWidth: "var(--site-cv-content-width)",
            gap: "var(--site-cv-section-gap)",
          }}
        >
          {cvSections.map((section) => (
            <section key={section.heading}>
              <h2 className="type-body mb-7">{section.heading}</h2>
              <ul className="flex flex-col gap-[22px]">
                {section.entries.map((e, i) => (
                  <li key={i} className="type-body">
                    <div className="type-meta mb-0.5 italic text-black">{e.year}</div>
                    <div>{e.title}</div>
                    {e.subtitle ? <div>{e.subtitle}</div> : null}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </SiteEditPageShell>
  );
}

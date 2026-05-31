import EditAwareLink from "@/components/EditAwareLink";
import cvContent from "@/content/cv.json";
import { projects } from "@/content/projects";
import { siteConfig } from "@/content/site";

type Props = {
  className?: string;
  onNavigate?: () => void;
};

/** Shared index panel — works / contacts / recognition (mobile home + desktop project pages). */
export default function SiteIndexPanel({ className = "", onNavigate }: Props) {
  const awards =
    cvContent.sections.find((s) => s.heading === "Awards")?.entries ?? [];

  return (
    <div className={`site-index-panel type-body ${className}`.trim()}>
      <section className="site-index-panel__section">
        <h2 className="site-index-panel__heading">works</h2>
        <ul className="site-index-panel__list">
          {projects.map((p) => (
            <li key={p.slug}>
              <EditAwareLink
                href={`/projects/${p.slug}`}
                className="site-index-panel__link cursor-interactive"
                onClick={onNavigate}
              >
                {p.title}
              </EditAwareLink>
            </li>
          ))}
        </ul>
      </section>

      <section className="site-index-panel__section">
        <h2 className="site-index-panel__heading">contacts</h2>
        <ul className="site-index-panel__list">
          <li>
            <a
              href={`mailto:${siteConfig.email}`}
              className="site-index-panel__link cursor-interactive"
            >
              {siteConfig.email}
            </a>
          </li>
          <li>
            <EditAwareLink
              href="/contact"
              className="site-index-panel__link cursor-interactive"
              onClick={onNavigate}
            >
              Contact page
            </EditAwareLink>
          </li>
        </ul>
      </section>

      <section className="site-index-panel__section">
        <h2 className="site-index-panel__heading">recognition</h2>
        <ul className="site-index-panel__list">
          {awards.map((entry, i) => (
            <li key={i} className="site-index-panel__recognition">
              <span className="site-index-panel__year">{entry.year}</span>
              <span>{entry.title}</span>
              {entry.subtitle ? (
                <span className="site-index-panel__subtitle">{entry.subtitle}</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

import { allProjects } from "@/content/projects";
import ProjectThumb from "@/components/ProjectThumb";
import SiteEditPageShell from "@/components/editor/SiteEditPageShell";

const homePagePairings: Array<{
  left?: { slug: string; size?: "sm" | "md" | "lg" };
  right?: { slug: string; size?: "sm" | "md" | "lg" };
}> = [
  { left: { slug: "parliament-sports-complex", size: "md" }, right: { slug: "16-units-above-a-city-brewery", size: "lg" } },
  { left: { slug: "symbiosis", size: "lg" } },
  { left: { slug: "inflection-journal-vol-10", size: "sm" }, right: { slug: "shack-in-the-paddyfield", size: "md" } },
  { left: { slug: "eternal-voyage", size: "md" }, right: { slug: "breathe-on-the-land", size: "md" } },
  { right: { slug: "stool-sm-1-39-03", size: "sm" } },
];

export const dynamic = "force-dynamic";

export default function HomePage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const bySlug = new Map(allProjects.map((p) => [p.slug, p]));

  return (
    <SiteEditPageShell searchParams={searchParams}>
      <div
        style={{
          paddingTop: "var(--site-home-content-top)",
          paddingBottom: "var(--site-home-row-gap)",
          paddingLeft: "var(--site-margin-x)",
          paddingRight: "var(--site-margin-x)",
        }}
      >
        <div
          className="flex flex-col"
          style={{ gap: "var(--site-home-row-gap)" }}
        >
          {homePagePairings.map((row, i) => (
            <div
              key={i}
              className="flex items-end justify-center"
              style={{ gap: "var(--site-home-col-gap)" }}
            >
              {row.left && bySlug.get(row.left.slug) && (
                <ProjectThumb
                  slug={row.left.slug}
                  title={bySlug.get(row.left.slug)!.title}
                  thumbnail={bySlug.get(row.left.slug)!.homeThumbnail}
                  size={row.left.size}
                />
              )}
              {row.right && bySlug.get(row.right.slug) && (
                <ProjectThumb
                  slug={row.right.slug}
                  title={bySlug.get(row.right.slug)!.title}
                  thumbnail={bySlug.get(row.right.slug)!.homeThumbnail}
                  size={row.right.size}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </SiteEditPageShell>
  );
}

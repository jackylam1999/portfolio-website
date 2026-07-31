import { allProjects } from "@/content/projects";
import type { Project, ProjectImage } from "@/content/types";
import { HOME_LAYOUT_ROWS, type HomeLayoutSlot } from "@/content/home-layout";
import HomeCompositionFigure from "@/components/home/HomeCompositionFigure";
import SiteEditPageShell from "@/components/editor/SiteEditPageShell";
import MobileHomePage from "@/components/mobile/MobileHomePage";

/**
 * Resolve which ProjectImage a slot should render. Defaults to the project's
 * `homeThumbnail`; `variant: "side-street"` picks Parliament Sports Complex's
 * second home-page photo (the street-level facade) out of its sections.
 */
function resolveSlotImage(
  project: Project | undefined,
  variant: HomeLayoutSlot["variant"]
): ProjectImage | undefined {
  if (!project) return undefined;
  if (variant === "side-street") {
    return project.sections.find((s) => s.id === "side-street")?.images?.[0];
  }
  return project.homeThumbnail;
}

export const dynamic = "force-dynamic";

export default function HomePage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const bySlug = new Map(allProjects.map((p) => [p.slug, p]));

  return (
    <SiteEditPageShell searchParams={searchParams}>
      <div className="home-layout-desktop">
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
            {HOME_LAYOUT_ROWS.map((row, rowIndex) => {
              // Convert each slot's absolute leftPct into a margin-left relative
              // to the previous slot's right edge, so slots lay out correctly as
              // flex children in normal document flow (no absolute positioning,
              // so row height stays driven by content).
              let cursorPct = 0;
              const slots = row.map((slot) => {
                const marginLeftPct = slot.leftPct - cursorPct;
                cursorPct = slot.leftPct + slot.widthPct;
                return { slot, marginLeftPct };
              });

              return (
                <div key={rowIndex} className="flex w-full items-start">
                  {slots.map(({ slot, marginLeftPct }, i) => {
                    const project = bySlug.get(slot.slug);
                    if (!project) return null;

                    return (
                      <HomeCompositionFigure
                        key={`${slot.slug}-${slot.variant ?? "home"}-${i}`}
                        slug={slot.slug}
                        title={project.title}
                        marginLeftPct={marginLeftPct}
                        widthPct={slot.widthPct}
                        aspect={slot.aspect}
                        captionBelow={slot.captionBelow}
                        placeholder={slot.placeholder}
                        image={
                          slot.placeholder
                            ? undefined
                            : resolveSlotImage(project, slot.variant)
                        }
                        priority={rowIndex === 0}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <MobileHomePage />
    </SiteEditPageShell>
  );
}

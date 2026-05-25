import SiteEditPageShell from "@/components/editor/SiteEditPageShell";
import { siteConfig } from "@/content/site";

export const dynamic = "force-dynamic";

export default function ContactPage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  return (
    <SiteEditPageShell searchParams={searchParams}>
      <div className="flex min-h-screen items-center justify-center">
        <a
          href={`mailto:${siteConfig.email}`}
          className="type-lg cursor-interactive text-black"
        >
          {siteConfig.email}
        </a>
      </div>
    </SiteEditPageShell>
  );
}

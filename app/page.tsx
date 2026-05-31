import SiteEditPageShell from "@/components/editor/SiteEditPageShell";
import DesktopHomePage from "@/components/home/DesktopHomePage";
import MobileHomePage from "@/components/mobile/MobileHomePage";

export const dynamic = "force-dynamic";

export default function HomePage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  return (
    <SiteEditPageShell searchParams={searchParams}>
      <div className="home-layout-desktop">
        <DesktopHomePage />
      </div>
      <MobileHomePage />
    </SiteEditPageShell>
  );
}

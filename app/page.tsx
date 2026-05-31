import SiteEditPageShell from "@/components/editor/SiteEditPageShell";
import DesktopHomePage from "@/components/home/DesktopHomePage";
import MobileHomePage from "@/components/mobile/MobileHomePage";
import { homeGalleryPool } from "@/content/home-gallery-pool";
import { filterHomeGalleryPool } from "@/lib/home-gallery-filter";
import { buildHomeGalleryLayout } from "@/lib/home-gallery-layout";
import { randomInt } from "node:crypto";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { edit?: string };
}) {
  const seed = randomInt(0x100000000);
  const pool = await filterHomeGalleryPool(homeGalleryPool);
  const galleryRows = buildHomeGalleryLayout(pool, seed);

  return (
    <SiteEditPageShell searchParams={searchParams}>
      <div className="home-layout-desktop">
        <DesktopHomePage galleryRows={galleryRows} gallerySeed={seed} />
      </div>
      <MobileHomePage />
    </SiteEditPageShell>
  );
}

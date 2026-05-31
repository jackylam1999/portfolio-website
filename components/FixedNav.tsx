"use client";

import EditAwareLink from "@/components/EditAwareLink";
import { siteConfig } from "@/content/site";

export default function FixedNav() {
  return (
    <nav
      aria-label="Primary"
      className="site-fixed-left type-nav select-none tracking-tightish text-black"
    >
      <EditAwareLink href="/" className="cursor-interactive inline-block">
        {siteConfig.name}
      </EditAwareLink>
    </nav>
  );
}

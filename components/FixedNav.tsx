"use client";

import EditAwareLink from "@/components/EditAwareLink";
import { topLeftNav } from "@/content/site";

export default function FixedNav() {
  return (
    <nav
      aria-label="Primary"
      className="site-fixed-left type-nav select-none tracking-tightish text-black"
    >
      <ul className="flex flex-col gap-px">
        {topLeftNav.map((item) => (
          <li key={item.label}>
            <EditAwareLink
              href={item.href}
              external={item.external}
              className="cursor-interactive inline-block"
            >
              {item.label}
            </EditAwareLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

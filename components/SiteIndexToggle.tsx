"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import SiteIndexPanel from "@/components/SiteIndexPanel";

/** Top-right index tap on desktop project pages — same overlay content as mobile home. */
export default function SiteIndexToggle() {
  const pathname = usePathname() || "";
  const onProject = pathname.startsWith("/projects/");
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  useEffect(() => {
    close();
  }, [pathname, close]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!onProject) return null;

  return (
    <>
      <button
        type="button"
        className={
          "site-index-toggle type-nav select-none tracking-tightish cursor-interactive" +
          (open ? " site-index-toggle--active" : "")
        }
        onClick={toggle}
        aria-expanded={open}
        aria-label="Index"
      >
        index
      </button>

      {open ? (
        <div className="site-index-overlay" role="dialog" aria-label="Site index">
          <SiteIndexPanel onNavigate={close} />
        </div>
      ) : null}
    </>
  );
}

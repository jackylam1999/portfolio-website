"use client";

import EditAwareLink from "@/components/EditAwareLink";
import { siteConfig } from "@/content/site";

interface Props {
  indexOpen: boolean;
  onToggleIndex: () => void;
  nameIsHome?: boolean;
  onNameClick?: () => void;
}

export default function MobileSiteChrome({
  indexOpen,
  onToggleIndex,
  nameIsHome,
  onNameClick,
}: Props) {
  return (
    <>
      <div className="mobile-site-chrome-under" aria-hidden={false}>
        {nameIsHome ? (
          <span className="mobile-site-chrome__tl mobile-site-chrome__tl--name">
            {siteConfig.name}
          </span>
        ) : (
          <span className="mobile-site-chrome__tl mobile-site-chrome__tl--name">
            {siteConfig.name}
          </span>
        )}

        <span
          className={
            "mobile-site-chrome__tr mobile-site-chrome__label" +
            (indexOpen ? " mobile-site-chrome__label--active" : "")
          }
        >
          Index
        </span>
      </div>

      <div className="mobile-site-chrome-over" aria-label="Site navigation">
        {nameIsHome ? (
          <button
            type="button"
            className="mobile-site-chrome__btn mobile-site-chrome__tl"
            onClick={onNameClick}
            aria-label={siteConfig.name}
          >
            {siteConfig.name}
          </button>
        ) : (
          <EditAwareLink
            href="/"
            className="mobile-site-chrome__btn mobile-site-chrome__tl mobile-site-chrome__link-hit"
            aria-label={siteConfig.name}
          >
            {siteConfig.name}
          </EditAwareLink>
        )}

        <button
          type="button"
          className="mobile-site-chrome__btn mobile-site-chrome__tr"
          onClick={onToggleIndex}
          aria-label="Index"
          aria-pressed={indexOpen}
        >
          Index
        </button>
      </div>
    </>
  );
}

// Top-level site config and external links.
// The top-left fixed nav uses these labels in order.

export const siteConfig = {
  name: "Jacky Chon Kei Lam",
  email: "chonkeilam.work@gmail.com",
  instagramUrl: "https://www.instagram.com/jackylam_16",
  formspreeEndpoint: "https://formspree.io/f/xnjrdnzk",
};

export type NavItem = {
  label: string;
  href: string;
  /** Open in a new tab (for external links like Instagram) */
  external?: boolean;
};

export const topLeftNav: NavItem[] = [
  { label: "Jacky Chon Kei Lam", href: "/" },
  { label: "Instagram", href: siteConfig.instagramUrl, external: true },
  { label: "Contact", href: "/contact" },
  { label: "CV", href: "/cv" },
];

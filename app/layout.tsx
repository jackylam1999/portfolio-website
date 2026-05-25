import type { Metadata } from "next";
import "./globals.css";
import FixedNav from "@/components/FixedNav";
import FixedProjectIndex from "@/components/FixedProjectIndex";
import ProjectDrawingList from "@/components/ProjectDrawingList";
import CustomCursor from "@/components/CustomCursor";
import { CURSOR_BOOT_SCRIPT } from "@/lib/cursor";
import { siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: `${siteConfig.name} — Architecture portfolio.`,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preload" href="/cursors/blank-32.png" as="image" />
        <script
          dangerouslySetInnerHTML={{
            __html: CURSOR_BOOT_SCRIPT,
          }}
        />
      </head>
      <body className="font-serif text-black antialiased">
        <CustomCursor />
        <FixedNav />
        <FixedProjectIndex />
        <ProjectDrawingList />
        <main className="site-main min-h-screen">{children}</main>
      </body>
    </html>
  );
}

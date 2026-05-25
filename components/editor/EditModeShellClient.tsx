"use client";

import { Suspense, type ReactNode } from "react";
import LayoutGridOverlay from "@/components/LayoutGridOverlay";
import EditorToolbar from "@/components/editor/EditorToolbar";
import { SiteEditorProvider } from "@/components/editor/EditorProvider";

/** Client grid + toolbar for non-project pages in ?edit=1 mode. */
export default function EditModeShellClient({ children }: { children: ReactNode }) {
  return (
    <SiteEditorProvider enabled>
      <LayoutGridOverlay enabled />
      <Suspense fallback={null}>
        <EditorToolbar />
      </Suspense>
      {children}
    </SiteEditorProvider>
  );
}

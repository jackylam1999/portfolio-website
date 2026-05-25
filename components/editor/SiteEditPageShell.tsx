import type { ReactNode } from "react";
import {
  CLEAR_EDITOR_SCRIPT,
  isEditMode,
  SET_EDITOR_SCRIPT,
} from "@/lib/edit-mode";
import EditModeShellClient from "@/components/editor/EditModeShellClient";

type SearchParams = { edit?: string };

/** Grid + toolbar wrapper for home, CV, and contact when ?edit=1. */
export default function SiteEditPageShell({
  searchParams,
  children,
}: {
  searchParams: SearchParams;
  children: ReactNode;
}) {
  const editOn = isEditMode(searchParams);

  if (!editOn) {
    return (
      <>
        <script dangerouslySetInnerHTML={{ __html: CLEAR_EDITOR_SCRIPT }} />
        {children}
      </>
    );
  }

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: SET_EDITOR_SCRIPT }} />
      <EditModeShellClient>{children}</EditModeShellClient>
    </>
  );
}

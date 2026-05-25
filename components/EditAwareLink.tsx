"use client";

import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { isEditMode, withEditParam } from "@/lib/edit-mode";

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
  external?: boolean;
};

function EditAwareLinkInner({ href, className, children, external }: Props) {
  const searchParams = useSearchParams();
  const editOn = isEditMode(searchParams);
  const resolved =
    editOn && !external && !href.startsWith("http") && !href.startsWith("mailto:")
      ? withEditParam(href)
      : href;

  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noreferrer noopener"
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={resolved} className={className}>
      {children}
    </Link>
  );
}

/** Internal link that keeps ?edit=1 when editor mode is active. */
export default function EditAwareLink(props: Props) {
  return (
    <Suspense
      fallback={
        props.external ||
        props.href.startsWith("http") ||
        props.href.startsWith("mailto:") ? (
          <a
            href={props.href}
            className={props.className}
            target="_blank"
            rel="noreferrer noopener"
          >
            {props.children}
          </a>
        ) : (
          <Link href={props.href} className={props.className}>
            {props.children}
          </Link>
        )
      }
    >
      <EditAwareLinkInner {...props} />
    </Suspense>
  );
}

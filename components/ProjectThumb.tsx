import EditAwareLink from "@/components/EditAwareLink";
import Image from "next/image";
import type { ProjectImage } from "@/content/types";

interface Props {
  slug: string;
  title: string;
  thumbnail?: ProjectImage;
  size?: "sm" | "md" | "lg";
}

const widthVar = {
  sm: "var(--site-thumb-sm)",
  md: "var(--site-thumb-md)",
  lg: "var(--site-thumb-lg)",
} as const;

export default function ProjectThumb({ slug, title, thumbnail, size = "md" }: Props) {
  const thumbWidth =
    size === "sm" ? 338 : size === "lg" ? 989 : 688;

  return (
    <EditAwareLink href={`/projects/${slug}`} className="cursor-interactive block">
      <figure style={{ width: widthVar[size] }}>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
          {thumbnail ? (
            <Image
              src={thumbnail.src}
              alt={thumbnail.alt || title}
              fill
              draggable={false}
              sizes={`(max-width: 2560px) ${thumbWidth}px, ${thumbWidth}px`}
              quality={85}
              unoptimized={thumbnail.src.endsWith(".webp")}
              className="object-cover"
            />
          ) : (
            <div className="type-caption flex h-full w-full items-center justify-center text-neutral-400">
              Image placeholder
            </div>
          )}
        </div>
        <figcaption className="type-caption mt-2 text-black">{title}</figcaption>
      </figure>
    </EditAwareLink>
  );
}

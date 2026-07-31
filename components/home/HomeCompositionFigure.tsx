import EditAwareLink from "@/components/EditAwareLink";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { ProjectImage } from "@/content/types";

interface Props {
  slug: string;
  title: string;
  /** Left gap before this image, as % of the row's width (see app/page.tsx cursor math). */
  marginLeftPct: number;
  /** Image width, as % of the row's width. */
  widthPct: number;
  aspect: number;
  captionBelow: boolean;
  /** Undefined when `placeholder` is true. */
  image?: ProjectImage;
  placeholder?: boolean;
  priority?: boolean;
}

export default function HomeCompositionFigure({
  slug,
  title,
  marginLeftPct,
  widthPct,
  aspect,
  captionBelow,
  image,
  placeholder,
  priority,
}: Props) {
  // Percentage width/margin must live on the flex row's direct child. Putting
  // them on an inner <figure> makes the browser resolve % against a shrink-wrapped
  // link box (~60px wide) instead of the full row.
  const slotStyle: CSSProperties = {
    marginLeft: `${marginLeftPct}%`,
    width: `${widthPct}%`,
    flex: "0 0 auto",
  };
  const mediaStyle: CSSProperties = { aspectRatio: `${aspect}` };

  return (
    <div style={slotStyle}>
      <EditAwareLink
        href={`/projects/${slug}`}
        className="cursor-interactive block"
      >
        <figure>
        <div
          className="relative w-full overflow-hidden bg-neutral-100"
          style={mediaStyle}
        >
          {placeholder || !image ? (
            <div className="type-caption flex h-full w-full items-center justify-center border border-dashed border-neutral-300 text-neutral-400">
              Image placeholder
            </div>
          ) : (
            <Image
              src={image.src}
              alt={image.alt || title}
              fill
              draggable={false}
              sizes="(max-width: 2560px) 100vw, 100vw"
              quality={85}
              unoptimized={image.src.endsWith(".webp")}
              priority={priority}
              className="object-cover"
            />
          )}
        </div>
        {captionBelow && (
          <figcaption className="type-caption mt-2 text-black">{title}</figcaption>
        )}
        </figure>
      </EditAwareLink>
    </div>
  );
}

import EditAwareLink from "@/components/EditAwareLink";
import Image from "next/image";
import type { HomeGalleryItem } from "@/content/home-gallery";
import { isPreOptimizedSrc, isVideoSrc } from "@/lib/project-media";

interface Props {
  item: HomeGalleryItem;
  priority?: boolean;
}

export default function HomeGalleryTile({ item, priority }: Props) {
  const { slug, title, image, colStart, colSpan, offsetSubunits } = item;
  const w = image.naturalWidth ?? 1600;
  const h = image.naturalHeight ?? 1200;
  const preOptimized = isPreOptimizedSrc(image.src);

  return (
    <EditAwareLink
      href={`/projects/${slug}`}
      className="home-gallery-tile cursor-interactive"
      style={{
        gridColumn: `${colStart} / span ${colSpan}`,
        marginTop:
          offsetSubunits > 0
            ? `calc(var(--site-grid-subunit) * ${offsetSubunits})`
            : undefined,
      }}
    >
      <figure className="home-gallery-tile__figure">
        <div
          className="home-gallery-tile__media"
          style={{
            aspectRatio: `${w} / ${h}`,
            ["--tile-aspect" as string]: String(w / h),
          }}
        >
          {isVideoSrc(image.src) ? (
            <video
              src={image.src}
              autoPlay
              loop
              muted
              playsInline
              className="home-gallery-tile__video"
            />
          ) : (
            <Image
              src={image.src}
              alt={image.alt || title}
              width={w}
              height={h}
              sizes={
                colSpan === 2
                  ? "(max-width: 2560px) 50vw, 1280px"
                  : "(max-width: 2560px) 25vw, 640px"
              }
              quality={88}
              priority={priority}
              unoptimized={preOptimized}
              className="home-gallery-tile__img"
              draggable={false}
            />
          )}
        </div>
        <figcaption className="home-gallery-tile__caption type-body">{title}</figcaption>
      </figure>
    </EditAwareLink>
  );
}

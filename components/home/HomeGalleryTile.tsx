import EditAwareLink from "@/components/EditAwareLink";
import Image from "next/image";
import type { HomeGalleryItem } from "@/content/home-gallery";
import { getHomeGalleryMediaOverride } from "@/content/home-gallery-media";
import { thumbServeWidth } from "@/lib/home-gallery-layout";
import { isPreOptimizedSrc, isVideoSrc } from "@/lib/project-media";

interface Props {
  item: HomeGalleryItem;
  priority?: boolean;
}

const widthVar = {
  sm: "var(--site-thumb-sm)",
  md: "var(--site-thumb-md)",
  lg: "var(--site-thumb-lg)",
} as const;

export default function HomeGalleryTile({ item, priority }: Props) {
  const { slug, title, image, widthTier } = item;
  const override = getHomeGalleryMediaOverride(image.src);
  const w = override?.width ?? image.naturalWidth ?? 1600;
  const h = override?.height ?? image.naturalHeight ?? 1200;
  const preOptimized = isPreOptimizedSrc(image.src);
  const isVideo = isVideoSrc(image.src);
  const isGif = /\.gif$/i.test(image.src);
  const contentWR = override?.contentWidthRatio;
  const displayAspect =
    isVideo && contentWR != null && contentWR > 0
      ? `${w * contentWR} / ${h}`
      : isVideo
        ? `${w} / ${h}`
        : undefined;
  const serveW = thumbServeWidth(widthTier);

  return (
    <div
      className="home-gallery-tile"
      style={{ width: widthVar[widthTier], flexShrink: 0 }}
    >
      <EditAwareLink
        href={`/projects/${slug}`}
        className="home-gallery-tile__link cursor-interactive"
      >
        <figure className="home-gallery-tile__figure">
          <div
            className={
              "home-gallery-tile__media" +
              (isVideo ? " home-gallery-tile__media--video" : "")
            }
            style={displayAspect ? { aspectRatio: displayAspect } : undefined}
          >
            {isVideo ? (
              <video
                src={image.src}
                autoPlay
                loop
                muted
                playsInline
                className="home-gallery-tile__video"
              />
            ) : isGif ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.src}
                alt={image.alt || title}
                width={w}
                height={h}
                className="home-gallery-tile__img"
                draggable={false}
              />
            ) : (
              <Image
                src={image.src}
                alt={image.alt || title}
                width={w}
                height={h}
                sizes={`(max-width: 2560px) ${serveW}px, ${serveW}px`}
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
    </div>
  );
}

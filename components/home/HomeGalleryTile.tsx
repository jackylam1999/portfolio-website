import EditAwareLink from "@/components/EditAwareLink";
import Image from "next/image";
import type { HomeGalleryItem } from "@/content/home-gallery";
import { HOME_GRID_COLS } from "@/content/home-gallery";
import { getHomeGalleryMediaOverride } from "@/content/home-gallery-media";
import { isPreOptimizedSrc, isVideoSrc } from "@/lib/project-media";

interface Props {
  item: HomeGalleryItem;
  priority?: boolean;
}

function tileSizes(colSpan: number): string {
  const pct = Math.round((colSpan / HOME_GRID_COLS) * 100);
  return `(max-width: 2560px) ${pct}vw, ${Math.round((2560 * colSpan) / HOME_GRID_COLS)}px`;
}

export default function HomeGalleryTile({ item, priority }: Props) {
  const { slug, title, image, colStart, colSpan } = item;
  const override = getHomeGalleryMediaOverride(image.src);
  const w = override?.width ?? image.naturalWidth ?? 1600;
  const h = override?.height ?? image.naturalHeight ?? 1200;
  const preOptimized = isPreOptimizedSrc(image.src);
  const isVideo = isVideoSrc(image.src);
  const isGif = /\.gif$/i.test(image.src);
  const videoScaleX = override?.videoScaleX ?? 1;

  return (
    <div
      className="home-gallery-tile"
      style={{ gridColumn: `${colStart} / span ${colSpan}` }}
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
            style={
              isVideo
                ? { ["--video-scale-x" as string]: String(videoScaleX) }
                : undefined
            }
          >
            {isVideo ? (
              <video
                src={image.src}
                autoPlay
                loop
                muted
                playsInline
                className="home-gallery-tile__video"
                style={{
                  width: `${videoScaleX * 100}%`,
                  marginLeft: `${-((videoScaleX - 1) / 2) * 100}%`,
                }}
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
                sizes={tileSizes(colSpan)}
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

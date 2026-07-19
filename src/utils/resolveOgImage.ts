import { cmsURL } from "@/constants";

export interface OgImage {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
}

interface MediaSize {
  url?: string | null;
  width?: number | null;
  height?: number | null;
}

interface MediaDoc {
  alt?: string;
  thumbnailURL?: string | null;
  sizes?: {
    ogImage?: MediaSize;
    portrait?: MediaSize;
  } | null;
}

/**
 * Prefers the 1200x630 ogImage size (added for OG/Twitter previews).
 * Falls back to portrait/cardThumbnail until existing media docs are
 * regenerated with the new size — see scripts/regenerate-media.ts in the CMS.
 */
export default function resolveOgImage(
  media?: MediaDoc | null,
): OgImage | undefined {
  if (!media) return undefined;

  const size = media.sizes?.ogImage?.url
    ? media.sizes.ogImage
    : media.sizes?.portrait?.url
      ? media.sizes.portrait
      : undefined;

  if (size?.url) {
    return {
      url: cmsURL + size.url,
      width: size.width ?? undefined,
      height: size.height ?? undefined,
      alt: media.alt,
    };
  }

  if (media.thumbnailURL) {
    return {
      url: cmsURL + media.thumbnailURL,
      width: 750,
      height: 500,
      alt: media.alt,
    };
  }

  return undefined;
}

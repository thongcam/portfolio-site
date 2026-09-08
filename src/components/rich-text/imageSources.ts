interface SingleImage {
    url: string,
    width: number,
    height: number,
}

/** The populated shape of a Media document, as returned by the CMS. */
export interface MediaLike {
    url: string,
    alt: string,
    width: number,
    height: number,
    sizes?: {[size: string] : SingleImage},
}

/**
 * A srcSet may only contain variants of the *same* image at different
 * resolutions. Most of the Media collection's `imageSizes` are fixed-dimension
 * centre crops for other purposes (cardThumbnail 750x500, portrait 400x500,
 * ogImage 1200x630) — offering those as srcSet candidates lets the browser
 * swap in a cropped image and silently cut off part of the picture. Only
 * `tablet` (width-only, height auto) preserves the original aspect ratio, so
 * candidates are matched against the original's ratio rather than hardcoded
 * by name, keeping this correct if the CMS sizes change.
 */
const RATIO_TOLERANCE = 0.01;

export const buildSrcSet = (media: MediaLike) => {
  const { url, width, height, sizes } = media;
  const originalRatio = width / height;

  const aspectPreserving = Object.values(sizes ?? {})
    .filter(
      (size) =>
        size?.url &&
        size.width &&
        size.height &&
        Math.abs(size.width / size.height - originalRatio) < RATIO_TOLERANCE,
    )
    .map((size) => ({
      src: size.url,
      width: size.width,
      height: size.height,
    }));

  return [...aspectPreserving, { src: url, width, height }];
};

/** Largest aspect-ratio-preserving variant below the original, if any. */
export const preferredSrc = (media: MediaLike) => {
  const candidates = buildSrcSet(media);
  return candidates.length > 1 ? candidates[candidates.length - 2].src : media.url;
};

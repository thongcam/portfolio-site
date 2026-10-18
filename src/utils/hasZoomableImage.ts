import type { SerializedLexicalNode } from "lexical";

/**
 * Walks the Lexical tree checking for anything that opens a lightbox — an
 * upload node with `fields.zoomable` set, or an ImageCollection or
 * ImageCarousel block (every image in either is zoomable). Those are the only
 * parts of article rich text that need client JS, so this decides whether
 * `imageViewers.astro` is rendered — the carousel's prev/next controls live in
 * the same script, so they ride along on the same gate.
 */
export default function hasZoomableImage(obj: SerializedLexicalNode): boolean {
  function traverse(value: unknown): boolean {
    if (typeof value !== "object" || value === null) return false;

    if (
      "type" in value &&
      (value as { type?: string }).type === "upload" &&
      "fields" in value &&
      (value as { fields?: { zoomable?: boolean } }).fields?.zoomable
    ) {
      return true;
    }

    const blockType = (value as { fields?: { blockType?: string } }).fields
      ?.blockType;
    if (
      "fields" in value &&
      (blockType === "ImageCollectionBlock" || blockType === "ImageCarouselBlock")
    ) {
      return true;
    }

    return Object.values(value).some((child) => {
      if (Array.isArray(child)) {
        return child.some((item) => traverse(item));
      }
      return traverse(child);
    });
  }

  return traverse(obj);
}

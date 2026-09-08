import type { SerializedLexicalNode } from "lexical";

/**
 * Walks the Lexical tree checking for anything that opens a lightbox — an
 * upload node with `fields.zoomable` set, or an ImageCollection block (every
 * image in one is zoomable). Those are the only reasons case-study rich text
 * needs client hydration. Mux video and everything else render as static HTML.
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

    if (
      "fields" in value &&
      (value as { fields?: { blockType?: string } }).fields?.blockType ===
        "ImageCollectionBlock"
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

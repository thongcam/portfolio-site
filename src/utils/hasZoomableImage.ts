import type { SerializedLexicalNode } from "lexical";

/**
 * Walks the Lexical tree checking for an upload node with `fields.zoomable`
 * set — the only reason case-study rich text needs client hydration
 * (LightboxImage). Mux video and everything else render as static HTML.
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

    return Object.values(value).some((child) => {
      if (Array.isArray(child)) {
        return child.some((item) => traverse(item));
      }
      return traverse(child);
    });
  }

  return traverse(obj);
}

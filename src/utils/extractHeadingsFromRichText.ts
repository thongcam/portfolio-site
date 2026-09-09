import type { SerializedHeadingNode } from "@payloadcms/richtext-lexical";
import type { SerializedLexicalNode } from "lexical";
import extractPlainTextFromRichText from "./extractPlainTextFromRichText";
import "css.escape"

/**
 * Slugifies a heading into an element id.
 *
 * Deliberately not percent-encoded: a title like "User testing #1" encoded to
 * `user-testing-%231` can never be reached, because the browser decodes the
 * fragment to `user-testing-#1` before matching it against the id. Stripping
 * the punctuation instead keeps the anchor addressable.
 */
export const textToID = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

export default function extractHeadingsFromRichText(obj : SerializedLexicalNode) {
    let headings : {title: string, id: string, heading: string}[] = [];
  
    function traverse(obj:  SerializedLexicalNode) {
      if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          if (key === 'type' && value === 'heading') {
            const headingObj = obj as SerializedHeadingNode;
            let titleString = extractPlainTextFromRichText(headingObj)
            headings.push({
                title: titleString,
                id: textToID(titleString),
                heading: headingObj.tag
            })// Add space after each text entry
          } else if (typeof value === 'object' && value !== null) {
            traverse(value); // Recursively traverse nested objects
          } else if (Array.isArray(value)) {
            value.forEach(item => {
              if (typeof item === 'object' && item !== null) {
                traverse(item);
              }
            })
          }
        })
      }
    }

  
    traverse(obj);

    // Suffixed with the heading's position so repeated titles ("Findings"
    // appears three times) stay unique. Must stay 0-based and cover exactly
    // the same set the client script numbers — see scrollSpy.astro.
    headings.forEach((heading, key) => (heading.id += key))
    return headings; // Remove leading/trailing spaces
  }
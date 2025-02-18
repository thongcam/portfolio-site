import type { SerializedHeadingNode } from "@payloadcms/richtext-lexical";
import type { SerializedLexicalNode } from "lexical";
import extractPlainTextFromRichText from "./extractPlainTextFromRichText";

export const textToID = (text : string ) => text.toLowerCase().replaceAll(" ", "-")

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
    return headings; // Remove leading/trailing spaces
  }
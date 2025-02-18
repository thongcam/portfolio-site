import type { SerializedLexicalNode } from "lexical";


export default function extractPlainTextFromRichText(obj : SerializedLexicalNode) {
    let combinedText = "";
  
    function traverse(obj:  SerializedLexicalNode) {
      if (typeof obj === 'object' && obj !== null) {
        Object.entries(obj).forEach(([key, value]) => {
          if (key === 'text' && typeof value === 'string') {
            combinedText += value + " "; // Add space after each text entry
          } else if (typeof value === 'object' && value !== null) {
            traverse(value); // Recursively traverse nested objects
          } else if (Array.isArray(value)) {
            value.forEach(item => {
              if (typeof item === 'object' && item !== null) {
                traverse(item);
              } else if (typeof item === 'string' && key !== 'text') { //If the array contains strings but is not the "text" key
                combinedText += item + " ";
              }
            })
          }
        })
      }
    }
  
    traverse(obj);
    return combinedText.trim(); // Remove leading/trailing spaces
  }
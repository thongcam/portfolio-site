import type { SerializedUploadNode } from "@payloadcms/richtext-lexical";
import type { SerializedLexicalNode } from "lexical";
import { getImage } from "astro:assets";
import { cmsURL } from "../constants";
import type { GetImageResult } from "astro";

type UploadNodeWithURL = SerializedUploadNode & {url : string}

export default async function useAstroImage(obj : SerializedLexicalNode) {  
    async function traverse(obj:  SerializedLexicalNode) {
        let currentNode = obj;
      if (typeof currentNode === 'object' && currentNode !== null) {
        await Promise.all(Object.entries(currentNode).map(async ([key, value]) => {   
          if (key === 'mimeType' && (value as string).includes("image")) {
            const currentUploadNode = currentNode as UploadNodeWithURL
            const astroImage = await getImage({src: cmsURL + currentUploadNode.url, inferSize: true, format:"webp"})
            currentUploadNode.url = astroImage.src
            console.log(currentUploadNode.url)
          } else if (typeof value === 'object' && value !== null) {
            await traverse(value); // Recursively traverse nested objects
          } else if (Array.isArray(value)) {
            value.forEach(async (item) => {
              if (typeof item === 'object' && item !== null) {
                await traverse(item);
              }
            })
          }
        }))
      }
    }

    await traverse(obj);
  }
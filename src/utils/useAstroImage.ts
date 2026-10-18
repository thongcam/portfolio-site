import type { SerializedUploadNode } from "@payloadcms/richtext-lexical";
import type { SerializedLexicalNode } from "lexical";
import { getImage } from "astro:assets";
import { cmsURL } from "../constants";
import type { GetImageResult } from "astro";

type UploadNodeWithURL = SerializedUploadNode & { url: string; width: number; height: number }

export default async function useAstroImage(obj : SerializedLexicalNode) {  
    async function traverse(obj:  SerializedLexicalNode) {
      let currentNode = obj;
      if (typeof currentNode === 'object' && currentNode !== null) {
        await Promise.all(Object.entries(currentNode).map(async ([key, value]) => {   
          if (key === 'mimeType' && typeof(value) === "string" && value.includes("image")) {
            const currentUploadNode = currentNode as UploadNodeWithURL
            // Variants wider than 1600px are what the lightbox shows zoomed in,
            // where compression artefacts on small text are visible — so they
            // get a higher quality than the inline sizes.
            const quality = currentUploadNode.width > 1600 ? 90 : 80
            const astroImage = await getImage({src: cmsURL + currentUploadNode.url, width: currentUploadNode.width, height: currentUploadNode.height, format:"webp", quality, densities: [0.5, 1]})
            currentUploadNode.url = astroImage.src
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
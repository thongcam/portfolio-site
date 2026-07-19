import type { SerializedUploadNode } from "@payloadcms/richtext-lexical";
import { UploadJSXConverter, type JSXConverters } from "@payloadcms/richtext-lexical/react";
import { cmsURL } from "@/constants";
import LightboxImage from "../lightbox-image/LightboxImage";
import { RICH_TEXT_IMAGE_SIZES } from "../constants";
import { RichTextLexical } from "../richTextLexical";

interface SingleImage {
    url: string,
    width: number,
    height: number,
}

type ImageDocument = SerializedUploadNode & {
    value: {
        url: string,
        alt: string,
        width: number,
        height: number,
        sizes: {[size: string] :  SingleImage}
    },
}

const updateImageURLs = (uploadDocument : any) => {
  if (!uploadDocument) return;
  Object.keys(uploadDocument).forEach(function(key) {
    if (typeof uploadDocument[key] === "object" && uploadDocument[key] !== null) {
      updateImageURLs(uploadDocument[key]);
    } else if (typeof uploadDocument[key] === "string") {
      if (key === "url" || key === "thumbnailURL") {
        uploadDocument[key] = cmsURL + uploadDocument[key]
      }
    }
  });
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

const buildSrcSet = (imageDocument: ImageDocument) => {
  const { url, width, height, sizes } = imageDocument.value;
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
const preferredSrc = (imageDocument: ImageDocument) => {
  const candidates = buildSrcSet(imageDocument);
  return candidates.length > 1 ? candidates[candidates.length - 2].src : imageDocument.value.url;
};

export const CustomUploadJSXConverter : JSXConverters = {
    upload: ({node}) => {
      if(node.fields && node.fields.zoomable) {
        const imageDocument =  node as ImageDocument;
          const srcSet = buildSrcSet(imageDocument)
          return <LightboxImage

            src={preferredSrc(imageDocument)}
            alt={imageDocument.value.alt}
            caption={imageDocument.fields.caption}
            width={imageDocument.value.width}
            height={imageDocument.value.height}
            srcSet={srcSet}
          ></LightboxImage>
        } else {
          const imageDocument =  node as ImageDocument;
          // width/height stay at the original dimensions so the reserved
          // aspect-ratio box is unchanged; srcSet/sizes only steer which
          // resolution is downloaded. Previously this served the full-size
          // original (often ~3840w) for an image rendered ~354px wide.
          const srcSet = buildSrcSet(imageDocument)
          return (<figure className="flex flex-col my-5 gap-2">
              <img
                src={preferredSrc(imageDocument)}
                alt={imageDocument.value.alt}
                width={imageDocument.value.width}
                height={imageDocument.value.height}
                srcSet={srcSet.map(s => `${s.src} ${s.width}w`).join(', ')}
                sizes={RICH_TEXT_IMAGE_SIZES}
                loading="lazy"
                className="max-w-full h-auto rounded-md"
              />
              {node.fields && node.fields.caption && <figcaption className="text-sm text-pale-blue/80"><RichTextLexical data={node.fields.caption}/>
              </figcaption>}
          </figure>)
        }
      },
}
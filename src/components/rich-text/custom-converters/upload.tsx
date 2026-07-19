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

const buildSrcSet = (imageDocument: ImageDocument) => [
  ...Object.entries(imageDocument.value.sizes)
    .filter(([, imageSizeData]) => imageSizeData)
    .map(([, imageSizeData]) => ({
      src: imageSizeData.url,
      width: imageSizeData.width,
      height: imageSizeData.height,
    })),
  {
    src: imageDocument.value.url,
    width: imageDocument.value.width,
    height: imageDocument.value.height,
  },
];

export const CustomUploadJSXConverter : JSXConverters = {
    upload: ({node}) => {
      if(node.fields && node.fields.zoomable) {
        const imageDocument =  node as ImageDocument;
          const srcSet = buildSrcSet(imageDocument)
          return <LightboxImage
            
            src={(imageDocument.value.sizes.tablet.url || imageDocument.value.url) }
            alt={imageDocument.value.alt}
            caption={imageDocument.fields.caption}
            width={imageDocument.value.sizes.tablet.width}
            height={imageDocument.value.sizes.tablet.height}
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
                src={imageDocument.value.sizes.tablet?.url || imageDocument.value.url}
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
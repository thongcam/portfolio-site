import type { SerializedUploadNode } from "@payloadcms/richtext-lexical";
import { UploadJSXConverter, type JSXConverters } from "@payloadcms/richtext-lexical/react";
import LightboxImage from "../lightbox-image/LightboxImage";
import { RICH_TEXT_IMAGE_SIZES } from "../constants";
import { RichTextLexical } from "../richTextLexical";
import { buildSrcSet, preferredSrc, type MediaLike } from "../imageSources";

type ImageDocument = SerializedUploadNode & {
    value: MediaLike,
}

export const CustomUploadJSXConverter : JSXConverters = {
    upload: ({node}) => {
      if(node.fields && node.fields.zoomable) {
        const imageDocument =  node as ImageDocument;
          const srcSet = buildSrcSet(imageDocument.value)
          return <LightboxImage

            src={preferredSrc(imageDocument.value)}
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
          const srcSet = buildSrcSet(imageDocument.value)
          return (<figure className="flex flex-col gap-2">
              <img
                src={preferredSrc(imageDocument.value)}
                alt={imageDocument.value.alt}
                width={imageDocument.value.width}
                height={imageDocument.value.height}
                srcSet={srcSet.map(s => `${s.src} ${s.width}w`).join(', ')}
                sizes={RICH_TEXT_IMAGE_SIZES}
                loading="lazy"
                className="max-w-full h-auto rounded-md"
              />
              {node.fields && node.fields.caption && <figcaption className="text-caption text-blue-900/80"><RichTextLexical data={node.fields.caption}/>
              </figcaption>}
          </figure>)
        }
      },
}

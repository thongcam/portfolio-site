import type { SerializedUploadNode } from "@payloadcms/richtext-lexical";
import { UploadJSXConverter, type JSXConverters } from "@payloadcms/richtext-lexical/react";
import { cmsURL } from "../../../constants";
import LightboxImage from "../../../pages/case-studies/components/LightboxImage";
import { Fragment } from "react/jsx-runtime";
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
  Object.keys(uploadDocument).forEach(function(key) {
    if (typeof uploadDocument[key] === "object") {
      if (uploadDocument[key] !== undefined) {
        updateImageURLs(uploadDocument[key]);
      }
    } else {
      if (key === "url" || key === "thumbnailURL") {
        uploadDocument[key] = cmsURL + uploadDocument[key]
      }
    }
  });
}

export const CustomUploadJSXConverter : JSXConverters = {
    upload: ({node, ...args}) => {
      if(node.fields.zoomable) {
        const imageDocument =  node as ImageDocument;
          const srcSet = [
            ...Object.entries(imageDocument.value.sizes).filter(([imageSize,imageSizeData]) => imageSizeData).map(([imageSize, imageSizeData]) => {
              return {
                src: cmsURL + encodeURIComponent(imageSizeData.url),
                width: imageSizeData.width,
                height: imageSizeData.height,
              }
            }),
            {
                src: cmsURL + encodeURIComponent(imageDocument.value.url),
                width:imageDocument.value.width,
                height:imageDocument.value.height
            }
          ]
          return <LightboxImage
            
            src={cmsURL + encodeURIComponent(imageDocument.value.sizes.tablet.url || imageDocument.value.url) }
            alt={imageDocument.value.alt}
            caption={imageDocument.fields.caption}
            width={imageDocument.value.sizes.tablet.width}
            height={imageDocument.value.sizes.tablet.height}
            srcSet={srcSet}
          ></LightboxImage>
        } else {
          updateImageURLs(node)
          return (<figure className="flex flex-col my-5 gap-2">
              {UploadJSXConverter.upload?.({node, ...args})}
              {node.fields.caption && <figcaption className="text-sm text-pale-blue/80"><RichTextLexical data={node.fields.caption}/>
              </figcaption>}
          </figure>)
        }
      },
}
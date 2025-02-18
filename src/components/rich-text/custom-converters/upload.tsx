import type { SerializedUploadNode } from "@payloadcms/richtext-lexical";
import { UploadJSXConverter, type JSXConverters } from "@payloadcms/richtext-lexical/react";
import { cmsURL } from "../../../constants";
import LightboxImage from "../../../pages/case-studies/components/LightboxImage";


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

export const CustomUploadJSXConverter : JSXConverters = {
    upload: ({node, ...args}) => {
        if(node.fields.zoomable) {
          const imageDocument =  node as ImageDocument;
          return <LightboxImage
            
            src={cmsURL + imageDocument.value.sizes.tablet.url}
            alt={imageDocument.value.alt}
            caption={imageDocument.fields.caption}
            width={imageDocument.value.sizes.tablet.width}
            height={imageDocument.value.sizes.tablet.height}
            srcSet={
              [
                ...Object.entries(imageDocument.value.sizes).map(([imageSize, imageSizeData]) => {
                  return {
                    src: cmsURL + imageSizeData.url,
                    width: imageSizeData.width,
                    height: imageSizeData.height,
                  }
                }),
                {
                    src: cmsURL + imageDocument.value.url,
                    width:imageDocument.value.width,
                    height:imageDocument.value.height
                }
              ]
            }
          ></LightboxImage>
        } else {
          return UploadJSXConverter.upload?.({node:node, ...args})
        }
      },
}
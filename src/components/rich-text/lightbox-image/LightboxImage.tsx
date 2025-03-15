import { Fragment, useRef, useState } from "react";
import Lightbox, { type ImageSource } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions  from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import styles from "./LightboxImage.module.css";
import type { SerializedEditorState } from "lexical";
import { RichTextLexical } from "../richTextLexical";

interface LightboxImageProps {
    src: string;
    alt: string;
    caption?: SerializedEditorState;
    width: number;
    height: number;
    srcSet?: ImageSource[]
}

export default function LightboxImage({src, alt, caption, width, height, srcSet} : LightboxImageProps) {
    const [open, setOpen] = useState(false);
    const zoomRef = useRef(null);
    const captionsRef = useRef(null);
return (
    <Fragment>
        <Lightbox
            open={open}
            close={() => setOpen(false)}
            slides={[{
                src: src, 
                alt: alt,
                width: width,
                height: height,
                srcSet: srcSet,
                description: caption ? <RichTextLexical data={caption}/> : ""
            }]}
            plugins={[Zoom, Captions]}
            zoom={{ ref: zoomRef, scrollToZoom: true, maxZoomPixelRatio: 2 }}
            captions={{ ref: captionsRef }}
            carousel={{
                finite: true,
                imageFit: "contain",
            }}

            controller={{ closeOnBackdropClick: true }}
            render={{
                buttonPrev:  () => null,
                buttonNext:  () => null,
            }}
        >

        </Lightbox>
        <figure className="flex flex-col gap-2 my-5">
            <button className="relative" onClick={() => setOpen(true)}>
                <span className={"absolute bottom-2 right-3 md:bottom-4 md:right-5 p-2 bg-pale-blue/50 rounded-full flex flex-row items-center  " + styles.zoomHint} style={{}}>
                    <img className="h-6" src="/icons/Frame inspect.svg" alt="" loading="lazy"/>
                    <span className="text-sm font-semibold text-white transition-all duration-150 ease-in">Click to zoom</span>
                </span>
                <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading="lazy"
                />
            </button>
            {
                caption &&
                <figcaption className="text-sm text-pale-blue/80">
                    <RichTextLexical data={caption}/>
                </figcaption>
            }
          </figure>
    </Fragment>

)
}
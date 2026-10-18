import type { ImageSource } from "yet-another-react-lightbox";
import styles from "./LightboxImage.module.css";
import type { SerializedEditorState } from "lexical";
import { RichTextLexical } from "../richTextLexical";
import { RICH_TEXT_IMAGE_SIZES } from "../constants";

interface LightboxImageProps {
    src: string;
    alt: string;
    caption?: SerializedEditorState;
    width: number;
    height: number;
    srcSet?: ImageSource[]
    /** Classes for the outer <figure>. Override to drop the default block
     *  margins when the image sits in a layout that owns its own spacing
     *  (e.g. the multi-column ImageCollection block). */
    className?: string;
    /** `sizes` for the inline thumbnail. Defaults to the full article column;
     *  override when the image occupies a fraction of it. Only affects which
     *  srcSet candidate is fetched — the Lightbox still gets the full srcSet. */
    sizes?: string;
}

/**
 * Server-rendered only. The `data-lightbox-*` attributes are what
 * `imageViewers.astro` reads to open the Lightbox, so the image, its srcSet
 * and its caption are all taken from this markup on click.
 */
export default function LightboxImage({src, alt, caption, width, height, srcSet, className = "flex flex-col gap-4", sizes = RICH_TEXT_IMAGE_SIZES} : LightboxImageProps) {
return (
        <figure className={className} data-lightbox-group>
            <button type="button" className="relative cursor-pointer" data-lightbox-trigger>
                <span className={"absolute bottom-2 right-3 md:bottom-4 md:right-5 p-2 bg-blue-900/50 rounded-full flex flex-row items-center  " + styles.zoomHint} style={{}}>
                    <img className="h-6" src="/icons/Frame inspect.svg" alt="" width={24} height={24} loading="lazy"/>
                    <span className="text-caption text-white transition-all duration-150 ease-in">Click to zoom</span>
                </span>
                <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                srcSet={srcSet?.map(s => `${s.src} ${s.width}w`).join(', ')}
                // Only affects which srcSet candidate the inline thumbnail
                // fetches — layout is unchanged, and the Lightbox receives the
                // full srcSet separately so zoomed quality is untouched.
                sizes={sizes}
                loading="lazy"
                data-lightbox-slide
                />
            </button>
            {
                caption &&
                <figcaption className="text-caption text-blue-900" data-lightbox-caption="0">
                    <RichTextLexical data={caption}/>
                </figcaption>
            }
          </figure>
)
}

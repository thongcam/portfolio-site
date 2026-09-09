import { Fragment, useRef, useState } from "react";
import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import type { SerializedEditorState } from "lexical";
import { RichTextLexical } from "../richTextLexical";
import { buildSrcSet, preferredSrc, type MediaLike } from "../imageSources";
import { RICH_TEXT_IMAGE_SIZES } from "../constants";
import lightboxStyles from "../lightbox-image/LightboxImage.module.css";

interface CarouselSlide {
    id?: string;
    image: MediaLike;
    caption?: SerializedEditorState;
}

/**
 * Exact path data from the Figma chevron, drawn in `currentColor` so the six
 * exported variants (left/right x default/active/disabled) collapse into one
 * shape whose state is a text-colour change.
 *
 * Figma's 20px mobile icon is the 16px path scaled by 1.25 with the stroke
 * held at 1.5 — so one 16-unit viewBox plus `non-scaling-stroke` reproduces
 * both sizes exactly, rather than the stroke thickening to 1.875 at 20px.
 */
function Chevron({ direction }: { direction: "left" | "right" }) {
    return (
        <svg
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
            className="size-5 md:size-4"
        >
            <path
                d={direction === "left" ? "M10.5 13L5.5 8L10.5 3" : "M5.5 3L10.5 8L5.5 13"}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

/**
 * Figma gives the control three states. Default and Active share the same
 * #1a1a1a chevron and differ only in the ring — gray-100 resting, gray-500
 * once engaged — and Disabled keeps the resting ring with a gray-300 chevron.
 * Active is the only interactive state in the design, so hover, keyboard
 * focus and press all resolve to it. The size steps 40 -> 36 at `md`, as the
 * component's Mobile and Desktop variants do.
 *
 * `enabled:` matters on the hover rules: `:hover` still matches a disabled
 * button, so without it the ring would light up on a control that does
 * nothing. The UA focus ring is deliberately left in place on top of the
 * Active border rather than replaced by it.
 */
const NAV_BUTTON_CLASS = [
    "flex size-10 items-center justify-center rounded-full border md:size-9",
    "text-text-primary border-gray-100 transition-colors",
    "cursor-pointer enabled:hover:border-gray-500 enabled:focus-visible:border-gray-500 enabled:active:border-gray-500",
    "disabled:cursor-default disabled:text-gray-300",
].join(" ");

/**
 * Images shown one at a time, with prev/next controls and a counter.
 *
 * The frame is sized to the *tallest* image in the set and every slide is
 * `object-contain`, so stepping through never shifts the page and never crops
 * — where a set shares one aspect ratio (the usual case) the images fill the
 * frame exactly, as the design shows.
 *
 * All slides are mounted and stacked, with only the active one visible, so
 * moving between them is instant rather than triggering a fetch. Opening any
 * slide hands the whole set to the Lightbox at the current index, so the
 * reader can keep paging through them zoomed in; `on.view` carries the
 * position back out so closing the Lightbox leaves the inline carousel where
 * they left off.
 */
export default function Carousel({ images }: { images?: CarouselSlide[] }) {
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const zoomRef = useRef(null);
    const captionsRef = useRef(null);

    if (!images?.length) return null;

    const current = images[index];
    // Smallest ratio = tallest image, the one the frame has to accommodate.
    const frameRatio = Math.min(...images.map(({ image }) => image.width / image.height));

    return (
        <Fragment>
            <Lightbox
                open={open}
                close={() => setOpen(false)}
                index={index}
                on={{ view: ({ index: i }) => setIndex(i) }}
                slides={images.map(({ image, caption }) => ({
                    src: preferredSrc(image),
                    alt: image.alt,
                    width: image.width,
                    height: image.height,
                    srcSet: buildSrcSet(image),
                    description: caption ? <RichTextLexical data={caption} /> : "",
                }))}
                plugins={[Zoom, Captions]}
                zoom={{ ref: zoomRef, scrollToZoom: true, maxZoomPixelRatio: 2 }}
                captions={{ ref: captionsRef }}
                carousel={{ finite: true, imageFit: "contain" }}
                controller={{ closeOnBackdropClick: true }}
            />

            <figure className="flex flex-col gap-3">
                <button
                    type="button"
                    className="relative w-full cursor-pointer"
                    style={{ aspectRatio: frameRatio }}
                    onClick={() => setOpen(true)}
                >
                    <span
                        className={
                            "absolute bottom-2 right-3 md:bottom-4 md:right-5 p-2 bg-blue-900/50 rounded-full flex flex-row items-center z-10 " +
                            lightboxStyles.zoomHint
                        }
                    >
                        <img className="h-6" src="/icons/Frame inspect.svg" alt="" width={24} height={24} loading="lazy" />
                        <span className="text-caption text-white transition-all duration-150 ease-in">Click to zoom</span>
                    </span>
                    {images.map(({ id, image }, i) => (
                        <img
                            key={id ?? i}
                            src={preferredSrc(image)}
                            alt={image.alt}
                            width={image.width}
                            height={image.height}
                            srcSet={buildSrcSet(image).map((s) => `${s.src} ${s.width}w`).join(", ")}
                            sizes={RICH_TEXT_IMAGE_SIZES}
                            loading={i === 0 ? undefined : "lazy"}
                            aria-hidden={i !== index}
                            className={
                                "absolute inset-0 size-full object-contain " +
                                (i === index ? "" : "invisible")
                            }
                        />
                    ))}
                </button>

                <div className="flex items-center justify-between gap-8">
                    <figcaption className="text-caption text-text-tertiary min-w-0 [&_strong]:text-text-primary">
                        {current.caption && <RichTextLexical data={current.caption} />}
                    </figcaption>

                    {images.length > 1 && (
                        <div className="flex shrink-0 items-center gap-3">
                            <button
                                type="button"
                                aria-label="Previous image"
                                disabled={index === 0}
                                onClick={() => setIndex((i) => i - 1)}
                                className={NAV_BUTTON_CLASS}
                            >
                                <Chevron direction="left" />
                            </button>
                            {/* A hidden copy of the widest possible counter holds the
                                width open, so the buttons never shift as the reader
                                pages through. With tabular figures every digit is the
                                same width, which makes that widest string the one where
                                both numbers carry the most digits. */}
                            <p
                                aria-live="polite"
                                className="text-caption text-text-tertiary grid tabular-nums whitespace-nowrap"
                            >
                                <span aria-hidden="true" className="invisible col-start-1 row-start-1">
                                    {images.length} / {images.length}
                                </span>
                                <span className="col-start-1 row-start-1 text-center">
                                    {index + 1} / {images.length}
                                </span>
                            </p>
                            <button
                                type="button"
                                aria-label="Next image"
                                disabled={index === images.length - 1}
                                onClick={() => setIndex((i) => i + 1)}
                                className={NAV_BUTTON_CLASS}
                            >
                                <Chevron direction="right" />
                            </button>
                        </div>
                    )}
                </div>
            </figure>
        </Fragment>
    );
}

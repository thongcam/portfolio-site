import { useState } from "react";
import { render } from "preact";
import Lightbox, { type Slide } from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Captions from "yet-another-react-lightbox/plugins/captions";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";

/**
 * The only client-side half of the article image viewers. Article rich text is
 * rendered on the server with no hydration; `imageViewers.astro` imports this
 * module once a zoomable image comes near the viewport, and calls
 * `openLightbox` when one is clicked.
 *
 * Slides are read back out of the server-rendered markup rather than passed as
 * props, so the page never carries a JSON copy of the article. Captions are
 * the already-rendered figcaption HTML, which is why no rich-text renderer
 * ships to the browser.
 */

export interface ViewerSlide {
    src: string;
    alt: string;
    width: number;
    height: number;
    srcSet: { src: string; width: number; height: number }[];
    /** Server-rendered caption markup, if the image has one. */
    captionHTML?: string;
}

interface ViewerProps {
    slides: ViewerSlide[];
    index: number;
    onView?: (index: number) => void;
}

function Viewer({ slides, index, onView }: ViewerProps) {
    const [open, setOpen] = useState(true);

    return (
        <Lightbox
            open={open}
            close={() => setOpen(false)}
            index={index}
            on={{ view: ({ index: i }) => onView?.(i) }}
            slides={slides.map(({ captionHTML, ...image }): Slide => ({
                ...image,
                description: captionHTML ? <div dangerouslySetInnerHTML={{ __html: captionHTML }} /> : "",
            }))}
            plugins={[Zoom, Captions]}
            zoom={{ scrollToZoom: true, maxZoomPixelRatio: 2 }}
            carousel={{ finite: true, imageFit: "contain" }}
            controller={{ closeOnBackdropClick: true }}
            // A lone image has nowhere to page to, so it gets no arrows at all.
            render={slides.length === 1 ? { buttonPrev: () => null, buttonNext: () => null } : undefined}
        />
    );
}

let root: HTMLElement | undefined;
let opened = 0;

export function openLightbox(slides: ViewerSlide[], index: number, onView?: (index: number) => void) {
    root ??= document.body.appendChild(document.createElement("div"));
    // A fresh key remounts the viewer, so each open starts from `open: true`
    // at the requested index instead of reusing the last one's closed state.
    render(<Viewer key={++opened} slides={slides} index={index} onView={onView} />, root);
}

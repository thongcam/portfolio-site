/**
 * `sizes` for images rendered inside case-study rich text.
 *
 * Describes the article column, not the viewport: the content container is
 * `max-w-screen-xl` with `clamp(1.5rem,7vw,5rem)` padding, and the article
 * inside it is `md:w-[80%] max-w-[80ch]`. Without this the browser assumes
 * full-viewport width and picks a far larger srcSet candidate than the
 * ~354px these images actually occupy on mobile.
 */
export const RICH_TEXT_IMAGE_SIZES =
  "(min-width: 1280px) 700px, (min-width: 768px) 70vw, calc(100vw - 3.5rem)";

/**
 * `sizes` for images inside an ImageCollection block, which flows the article
 * column into `columns-xs` (20rem) tracks with a 1.25rem gap.
 *
 * A second column only appears once the article itself is ~660px wide
 * (`floor((W + 20) / (320 + 20)) >= 2`), which happens at a ~940px viewport —
 * hence the extra breakpoint that RICH_TEXT_IMAGE_SIZES has no need for.
 * Above it each image occupies roughly half the column minus the gap; the
 * values below round up slightly, since over-estimating only costs a larger
 * candidate while under-estimating shows a blurry one.
 */
export const IMAGE_COLLECTION_SIZES =
  "(min-width: 1280px) 350px, (min-width: 940px) 35vw, (min-width: 768px) 70vw, calc(100vw - 3.5rem)";

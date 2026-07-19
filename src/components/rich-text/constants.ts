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

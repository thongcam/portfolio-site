/**
 * Shared `view-transition-name` for a case study's title.
 *
 * The homepage card, the "other case studies" card and the case-study page's
 * own <h1> all resolve to the same name for a given study — that match is what
 * lets the browser morph one into the other across the navigation. A card
 * carries its target as `url` ("case-studies/foo") while a page knows itself by
 * pathname ("/case-studies/foo"), so both shapes normalise here.
 *
 * The prefix keeps the result a valid CSS custom-ident, which a bare slug is
 * not guaranteed to be — one starting with a digit would be rejected.
 */
export default function caseStudyTitleTransition(pathOrUrl: string): string {
  const slug = pathOrUrl
    .replace(/^\/+/, "")
    .replace(/^case-studies\//, "")
    .replace(/\/+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-");

  return `case-study-title-${slug}`;
}

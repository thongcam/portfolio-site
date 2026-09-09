/**
 * Pull quote with an optional speaker line.
 *
 * `figure`/`figcaption` rather than a bare `blockquote`, because that is the
 * markup pattern for a quotation whose attribution is part of the content:
 * the speaker is not itself quoted, so it must sit outside the `blockquote`.
 */
export default function Quote({
  quote,
  attribution,
}: {
  quote: string
  attribution?: string | null
}) {
  if (!quote) return null

  return (
    <figure className="border-l-2 border-[var(--theme-ramp-400,var(--color-blue-400))]/50 pl-5 md:pl-7">
      <blockquote className="text-quote text-text-primary max-w-[500px]">
        {quote}
      </blockquote>
      {attribution && (
        <figcaption className="text-ui font-light text-text-secondary mt-3.5">
          {attribution}
        </figcaption>
      )}
    </figure>
  )
}

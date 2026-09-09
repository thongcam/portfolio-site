import type { SerializedEditorState } from 'lexical'
import { RichTextLexical } from '../richTextLexical'

type NumberedListItem = {
  id?: string
  title: string
  content: SerializedEditorState
}

/**
 * Numbered list with a heading and paragraph per entry, hairline-separated.
 *
 * Numbers come from the item's position, so they can never disagree with the
 * order. They are `aria-hidden` because the `<ol>` already conveys sequence to
 * assistive tech — announcing "1" twice would be noise.
 */
export default function NumberedList({ items }: { items?: NumberedListItem[] }) {
  if (!items?.length) return null

  // Wrapped so the article's rhythm treats this as a block, not as prose.
  // `.richText > p + ol` is the tighter spacing meant for the bullet and
  // numbered lists the list converter emits; a bare <ol> here would inherit it
  // and sit too close to the paragraph above.
  return (
    <div>
      <ol className="border-t border-gray-500/20">
        {items.map((item, index) => (
          <li
          key={item.id ?? index}
          className="flex items-start border-b border-gray-500/20 py-6"
        >
          {/* `leading-none` deliberately overrides the token here: a lone
              display digit needs its cap aligned to the heading's first line,
              whereas the token's 1.4 exists for wrapping quotes. */}
          <span
            aria-hidden="true"
            className="text-quote text-gray-400 w-10 shrink-0 pr-4 leading-none md:w-14 md:pr-5"
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-h3 text-text-primary pt-0.5 pb-1.5 md:pt-1 md:pb-2">
              {item.title}
            </p>
            <div className="text-body text-text-primary">
              <RichTextLexical data={item.content} />
            </div>
          </div>
        </li>
        ))}
      </ol>
    </div>
  )
}

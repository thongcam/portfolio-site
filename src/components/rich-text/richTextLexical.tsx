import {
  type JSXConvertersFunction,
  RichText,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { SerializedBlockNode, UploadData } from '@payloadcms/richtext-lexical'
import CalloutBlock from './callout-box/CalloutBox'
import ImageCollection from './image-collection/ImageCollection'
import Quote from './quote/Quote'
import Carousel from './carousel/Carousel'
import NumberedList from './numbered-list/NumberedList'
import Stats from './stats/Stats'
import { CustomHeadingJSXConverter } from './custom-converters/heading'
import { CustomListJSXConverter } from './custom-converters/list'
import { CustomParagraphJSXConverter } from './custom-converters/paragraph'
import { CustomUploadJSXConverter } from './custom-converters/upload'
import styles from "./richTextLexical.module.scss"
import { CustomTextJSXConverter } from './custom-converters/text'
import { YoutubeJSXConverter } from './custom-converters/youtube'


const jsxConverters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  // ...JSXConvertersExt,
  ...CustomHeadingJSXConverter,
  ...CustomTextJSXConverter,
  ...CustomListJSXConverter,
  ...CustomParagraphJSXConverter,
  ...CustomUploadJSXConverter,
  ...YoutubeJSXConverter,
  blocks: {
    // myTextBlock is the slug of the block
    CalloutBlock: ({node} : {node : SerializedBlockNode}) => <CalloutBlock emoji={node.fields.emoji} content={node.fields.content} color={node.fields.color}></CalloutBlock>,
    FigmaEmbedBlock: ({node} : {node: SerializedBlockNode}) => <div className="flex" dangerouslySetInnerHTML={{__html: node.fields.figmaEmbedCode}}></div>,
    ImageCarouselBlock: ({node} : {node: SerializedBlockNode}) => <Carousel images={node.fields.images} />,
    ImageCollectionBlock: ({node} : {node: SerializedBlockNode}) => <ImageCollection images={node.fields.images}></ImageCollection>,
    NumberedListBlock: ({node} : {node: SerializedBlockNode}) => <NumberedList items={node.fields.items} />,
    QuoteBlock: ({node} : {node: SerializedBlockNode}) => <Quote quote={node.fields.quote} attribution={node.fields.attribution} />,
    StatsBlock: ({node} : {node: SerializedBlockNode}) => <Stats stats={node.fields.stats} />,
    // Rendered as the native <mux-video> custom element (no React runtime
    // needed) — see muxAutoplay.astro for the vanilla enhancement script
    // that lazy-loads it and wires up autoplay-on-scroll. <mux-video> has no
    // player UI of its own, so `controls` gives it the browser's, and the
    // poster is set explicitly (mux-player used to derive it) so the frame
    // isn't blank before the element is defined.
    MuxVideoBlock: ({node} : {node: SerializedBlockNode}) => (
      <div className="w-full aspect-video mux-video-wrapper">
        <mux-video
          playback-id={node.fields.muxPlaybackId}
          poster={`https://image.mux.com/${node.fields.muxPlaybackId}/thumbnail.webp`}
          controls
          muted
          loop
          playsinline
          style={{ display: 'block', width: '100%', height: '100%' }}
        ></mux-video>
      </div>
    ),
  },
})

export const RichTextLexical = ({data} : { data : SerializedEditorState }) => {
  return (
    <RichText
      converters={jsxConverters}
      data={data}
      className={styles.richText}
    />
  )
}
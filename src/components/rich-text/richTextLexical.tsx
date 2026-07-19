import {
  type JSXConvertersFunction,
  RichText,
} from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { SerializedBlockNode, UploadData } from '@payloadcms/richtext-lexical'
import CalloutBlock from './callout-box/CalloutBox'
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
    FigmaEmbedBlock: ({node} : {node: SerializedBlockNode}) => <div className="flex my-5" dangerouslySetInnerHTML={{__html: node.fields.figmaEmbedCode}}></div>,
    // Rendered as the native <mux-player> custom element (no React runtime
    // needed) — see caseStudyContent.astro for the vanilla enhancement script
    // that lazy-loads the player and wires up autoplay-on-scroll.
    MuxVideoBlock: ({node} : {node: SerializedBlockNode}) => (
      <div className="w-full my-8 aspect-video mux-video-wrapper">
        <mux-player
          playback-id={node.fields.muxPlaybackId}
          muted
          loop
          playsinline
          style={{ width: '100%', height: '100%' }}
        ></mux-player>
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
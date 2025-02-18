import type { SerializedEditorState } from "lexical";
import { RichTextLexical } from "../../../components/rich-text/richTextLexical";

export default function CalloutBlock({emoji, content, color} : {emoji: string; content: SerializedEditorState, color : string}) {
  return (
    <div
      className="grid grid-cols-[auto_1fr] gap-x-5 place-items-start p-5 my-5 rounded-xl" style={{backgroundColor: color}}
    >
      <span >{emoji}</span>
      <RichTextLexical data={content}>
      </RichTextLexical>
    </div>
  )
}

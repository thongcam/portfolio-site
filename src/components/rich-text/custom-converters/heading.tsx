import type { JSXConverters } from "@payloadcms/richtext-lexical/react"
import extractPlainTextFromRichText from "../../../utils/extractPlainTextFromRichText"
import type { SerializedHeadingNode } from "@payloadcms/richtext-lexical"
import { textToID } from "../../../utils/extractHeadingsFromRichText"


export const CustomHeadingJSXConverter : JSXConverters<SerializedHeadingNode> = {
    heading: ({ node, nodesToJSX }) => {
        const children = nodesToJSX({
          nodes: node.children,
        })
    
        const NodeTag = node.tag
        const id = textToID(extractPlainTextFromRichText(node))
    
        switch (NodeTag) {
          case "h1":
            return <h1>{children}</h1>
        case "h2":
          return <h2 className="font-bold text-3xl mt-10 mb-5 scroll-spy-item" id={id}>{children}</h2>
        case "h3":
          return <h3
                    className="font-bold text-2xl mt-5 mb-3 scroll-spy-item"
                    id={id}
                  >{children}</h3>
        case "h4":
          return <h4
          className="font-bold text-xl mt-3 mb-2 scroll-spy-item"
          id={id}
        >{children}</h4>
    
          default:
            return <NodeTag>{children}</NodeTag>
            
        }
    
      },
}
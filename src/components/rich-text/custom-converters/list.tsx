import type { SerializedListNode } from "@payloadcms/richtext-lexical";
import type { JSXConverters } from "@payloadcms/richtext-lexical/react";

export const CustomListJSXConverter : JSXConverters<SerializedListNode> = {
  list: ({ node, nodesToJSX }) => {
      const children = nodesToJSX({
        nodes: node.children,
      })
  
      const NodeTag = node.tag
  
      return <NodeTag className={`list-${node?.listType} ${NodeTag === "ol"? "list-decimal" : "list-disc"} list-inside`}>{children}</NodeTag>
    }
}
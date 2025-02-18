import type { JSXConverters } from "@payloadcms/richtext-lexical/react";

export const CustomParagraphJSXConverter : JSXConverters = {
    paragraph: ({ node, nodesToJSX }) => {
        const children = nodesToJSX({
            nodes: node.children,
        })

        if (!children?.length) {
            return (
            <p>
                <br />
            </p>
            )
        }
        return <p className="text-base mb-2">{children}</p>
    },
}
import React from 'react'
import type { JSXConverters } from '@payloadcms/richtext-lexical/react'
import { IS_BOLD, IS_CODE, IS_ITALIC, IS_STRIKETHROUGH, IS_SUBSCRIPT, IS_SUPERSCRIPT, IS_UNDERLINE } from '@payloadcms/richtext-lexical/lexical'
import styles from '../richTextLexical.module.scss'

export const CustomTextJSXConverter: JSXConverters = {
	text: ({ node }: { node: any }) => {
		let text: React.ReactNode = node.text

		if (node.format & IS_BOLD) {
			text = <strong>{text}</strong>
		}
		if (node.format & IS_ITALIC) {
			text = <em>{text}</em>
		}
		if (node.format & IS_STRIKETHROUGH) {
			text = <span style={{ textDecoration: 'line-through' }}>{text}</span>
		}
		if (node.format & IS_UNDERLINE) {
			text = <span style={{ textDecoration: 'underline' }}>{text}</span>
		}
		if (node.format & IS_CODE) {
			text = <code>{text}</code>
		}
		if (node.format & IS_SUBSCRIPT) {
			text = <sub>{text}</sub>
		}
		if (node.format & IS_SUPERSCRIPT) {
			text = <sup>{text}</sup>
		}

		let style: React.CSSProperties = {}
		let className = ''

		if (node.style) {
			let match = node.style.match(/(?:^|;)\s?background-color: ([^;]+)/)
			match && (style.backgroundColor = match[1])

			match = node.style.match(/(?:^|;)\s?color: ([^;]+)/)
			match && (style.color = match[1])
		}

		const state = node['$']
		if (state) {
			if (state.textColor) {
				className += ` ${styles[state.textColor] || state.textColor}`
			}
			if (state.highlightColor) {
				className += ` ${styles[state.highlightColor] || state.highlightColor}`
			}
		}

		if (Object.keys(style).length > 0 || className.trim() !== '') {
			text = (
				<span
					style={Object.keys(style).length > 0 ? style : undefined}
					className={className.trim() !== '' ? className.trim() : undefined}
				>
					{text}
				</span>
			)
		}

		return text
	},
}
import type { ReactNode } from 'react'
import { parseMarkdown, type Block, type Inline } from '../lib/markdown'

/** Props of {@link Markdown}. */
interface MarkdownProps {
  /** The Markdown text to show. */
  source: string
  /**
   * The HTML heading level given to the highest heading used in the text (default 3, because the
   * page's own headings use `h1` and `h2`). Lower headings follow relative to it, so a text that
   * starts at `##` or at `###` looks the same. No heading is deeper than `h6`.
   */
  topLevel?: number
}

/**
 * Renders inline pieces as React elements. Text is always passed as a React child, never as HTML.
 *
 * @param inlines - the pieces from the Markdown parser
 * @returns the elements for the pieces
 */
function renderInlines(inlines: Inline[]): ReactNode {
  return inlines.map((inline, index) => {
    switch (inline.kind) {
      case 'text':
        return inline.text
      case 'code':
        return <code key={index}>{inline.text}</code>
      case 'strong':
        return <strong key={index}>{renderInlines(inline.children)}</strong>
      case 'em':
        return <em key={index}>{renderInlines(inline.children)}</em>
      case 'link':
        return (
          <a key={index} href={inline.href} rel="noreferrer">
            {renderInlines(inline.children)}
          </a>
        )
    }
  })
}

/**
 * Renders one block of the document.
 *
 * @param block - the block from the Markdown parser
 * @param index - position of the block, used as the React key
 * @param shift - added to the heading level of the Markdown to get the HTML heading level
 * @returns the element for the block
 */
function renderBlock(block: Block, index: number, shift: number): ReactNode {
  switch (block.kind) {
    case 'heading': {
      const Tag = `h${Math.min(6, block.level + shift)}` as 'h3'
      return <Tag key={index}>{renderInlines(block.inlines)}</Tag>
    }
    case 'paragraph':
      return <p key={index}>{renderInlines(block.inlines)}</p>
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul'
      return (
        <Tag key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>{renderInlines(item)}</li>
          ))}
        </Tag>
      )
    }
    case 'code':
      return (
        <pre key={index}>
          <code>{block.text}</code>
        </pre>
      )
  }
}

/**
 * Shows Markdown text (such as GitHub release notes) as headings, paragraphs, lists and code.
 * Only the simple formatting that {@link parseMarkdown} understands is supported; the text is
 * rendered as React elements, so nothing in it can add HTML to the page.
 *
 * @param props - see {@link MarkdownProps}
 */
export default function Markdown({ source, topLevel = 3 }: MarkdownProps) {
  const blocks = parseMarkdown(source)
  const levels = blocks.flatMap((block) => (block.kind === 'heading' ? [block.level] : []))
  const shift = topLevel - Math.min(...levels, 6)
  return <div className="markdown">{blocks.map((block, index) => renderBlock(block, index, shift))}</div>
}

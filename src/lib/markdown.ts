/**
 * A small, safe Markdown reader for release notes. It understands headings, paragraphs, bullet and
 * numbered lists, fenced code blocks, and inline bold, italic, code and https links. It produces a
 * plain data tree (never HTML), which `components/Markdown.tsx` renders as React elements, so text
 * from GitHub can never inject markup into the page. Anything else (tables, images, raw HTML)
 * stays as plain text.
 */

/** A piece of text inside a block. */
export type Inline =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'strong'; children: Inline[] }
  | { kind: 'em'; children: Inline[] }
  | { kind: 'link'; href: string; children: Inline[] }

/** A block of the document. */
export type Block =
  | { kind: 'heading'; level: number; inlines: Inline[] }
  | { kind: 'paragraph'; inlines: Inline[] }
  | { kind: 'list'; ordered: boolean; items: Inline[][] }
  | { kind: 'code'; text: string }

/**
 * Finds the next inline construct: `code`, **strong**, *emphasis* or [text](https://link). A link
 * address may contain one level of parentheses, such as `https://example.com/a_(b)`.
 */
const INLINE_PATTERN = /`([^`]+)`|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|\[([^\]]+)\]\(((?:[^\s()]|\([^\s()]*\))+)\)/

/** Only absolute https links are turned into links. */
const SAFE_LINK = /^https:\/\/[^\s<>"]+$/i

/**
 * Parses the inline formatting of one piece of text.
 *
 * @param text - text without line breaks
 * @returns the pieces in order; plain text between constructs becomes `text` pieces, and a link
 *   with an unsafe address is kept as its plain link text
 */
export function parseInline(text: string): Inline[] {
  const result: Inline[] = []
  let rest = text
  while (rest) {
    const match = INLINE_PATTERN.exec(rest)
    if (!match) break
    if (match.index > 0) result.push({ kind: 'text', text: rest.slice(0, match.index) })
    const [, code, strong, em, label, href] = match
    if (code !== undefined) result.push({ kind: 'code', text: code })
    else if (strong !== undefined) result.push({ kind: 'strong', children: parseInline(strong) })
    else if (em !== undefined) result.push({ kind: 'em', children: parseInline(em) })
    else if (SAFE_LINK.test(href)) result.push({ kind: 'link', href, children: parseInline(label) })
    else result.push(...parseInline(label))
    rest = rest.slice(match.index + match[0].length)
  }
  if (rest) result.push({ kind: 'text', text: rest })
  return result
}

/** A heading line such as `## Features`. */
const HEADING = /^(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/

/** A list item line such as `- text`, `* text` or `1. text`; group 1 is the number, if any. */
const LIST_ITEM = /^\s*(?:[-*+]|(\d+)[.)])\s+(.*)$/

/**
 * Parses Markdown text into blocks. Nested lists are flattened into one list, and an indented
 * line after a list item continues that item.
 *
 * @param source - the Markdown text
 * @returns the blocks in order
 */
export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = []
  let paragraph: string[] = []
  let list: Extract<Block, { kind: 'list' }> | null = null
  let fence: string[] | null = null

  /** Ends the paragraph being collected, if any. */
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: 'paragraph', inlines: parseInline(paragraph.join(' ')) })
    paragraph = []
  }

  for (const line of source.split('\n')) {
    if (fence) {
      if (line.trimStart().startsWith('```')) {
        blocks.push({ kind: 'code', text: fence.join('\n') })
        fence = null
      } else fence.push(line)
      continue
    }
    if (line.trimStart().startsWith('```')) {
      flushParagraph()
      list = null
      fence = []
      continue
    }
    if (!line.trim()) {
      flushParagraph()
      list = null
      continue
    }
    const heading = HEADING.exec(line)
    if (heading) {
      flushParagraph()
      list = null
      blocks.push({ kind: 'heading', level: heading[1].length, inlines: parseInline(heading[2]) })
      continue
    }
    const item = LIST_ITEM.exec(line)
    if (item) {
      flushParagraph()
      const ordered = item[1] !== undefined
      if (!list || list.ordered !== ordered) {
        list = { kind: 'list', ordered, items: [] }
        blocks.push(list)
      }
      list.items.push(parseInline(item[2]))
      continue
    }
    if (list && /^\s/.test(line)) {
      // An indented line continues the previous list item.
      const last = list.items.length - 1
      list.items[last] = [...list.items[last], { kind: 'text', text: ' ' }, ...parseInline(line.trim())]
      continue
    }
    list = null
    paragraph.push(line.trim())
  }
  if (fence) blocks.push({ kind: 'code', text: fence.join('\n') })
  flushParagraph()
  return blocks
}

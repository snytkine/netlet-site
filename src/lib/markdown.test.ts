import { describe, expect, it } from 'vitest'
import { parseInline, parseMarkdown } from './markdown'

describe('parseInline', () => {
  it('returns plain text as one piece and nothing for empty text', () => {
    expect(parseInline('hello world')).toEqual([{ kind: 'text', text: 'hello world' }])
    expect(parseInline('')).toEqual([])
  })

  it('finds code, bold and italic between plain text', () => {
    expect(parseInline('a `x` b **y** c *z* d')).toEqual([
      { kind: 'text', text: 'a ' },
      { kind: 'code', text: 'x' },
      { kind: 'text', text: ' b ' },
      { kind: 'strong', children: [{ kind: 'text', text: 'y' }] },
      { kind: 'text', text: ' c ' },
      { kind: 'em', children: [{ kind: 'text', text: 'z' }] },
      { kind: 'text', text: ' d' },
    ])
  })

  it('formats inside bold text and inside a link label', () => {
    expect(parseInline('**use `npm`**')).toEqual([
      { kind: 'strong', children: [{ kind: 'text', text: 'use ' }, { kind: 'code', text: 'npm' }] },
    ])
    expect(parseInline('[the **docs**](https://example.com/a)')).toEqual([
      { kind: 'link', href: 'https://example.com/a', children: [{ kind: 'text', text: 'the ' }, { kind: 'strong', children: [{ kind: 'text', text: 'docs' }] }] },
    ])
  })

  it('keeps only the label of a link that is not https', () => {
    expect(parseInline('[click](javascript:alert(1))')).toEqual([{ kind: 'text', text: 'click' }])
    expect(parseInline('[click](http://example.com)')).toEqual([{ kind: 'text', text: 'click' }])
    expect(parseInline('[click](/relative)')).toEqual([{ kind: 'text', text: 'click' }])
  })

  it('keeps one level of parentheses in a link address', () => {
    expect(parseInline('[w](https://example.com/a_(b))')).toEqual([
      { kind: 'link', href: 'https://example.com/a_(b)', children: [{ kind: 'text', text: 'w' }] },
    ])
  })

  it('leaves HTML as plain text', () => {
    expect(parseInline('<script>alert(1)</script>')).toEqual([{ kind: 'text', text: '<script>alert(1)</script>' }])
  })

  it('does not treat a lone star or underscores in words as formatting', () => {
    expect(parseInline('2 * 3 and snake_case_name')).toEqual([{ kind: 'text', text: '2 * 3 and snake_case_name' }])
  })
})

describe('parseMarkdown', () => {
  it('reads headings with their level and drops closing hashes', () => {
    expect(parseMarkdown('# One\n### Three ###')).toEqual([
      { kind: 'heading', level: 1, inlines: [{ kind: 'text', text: 'One' }] },
      { kind: 'heading', level: 3, inlines: [{ kind: 'text', text: 'Three' }] },
    ])
  })

  it('joins the lines of a paragraph and splits paragraphs at blank lines', () => {
    expect(parseMarkdown('first line\nsecond line\n\nnext')).toEqual([
      { kind: 'paragraph', inlines: [{ kind: 'text', text: 'first line second line' }] },
      { kind: 'paragraph', inlines: [{ kind: 'text', text: 'next' }] },
    ])
  })

  it('reads bullet lists with any bullet character and numbered lists', () => {
    const blocks = parseMarkdown('- a\n* b\n+ c\n\n1. one\n2) two')
    expect(blocks).toHaveLength(2)
    expect(blocks[0]).toMatchObject({ kind: 'list', ordered: false })
    expect(blocks[0].kind === 'list' && blocks[0].items).toHaveLength(3)
    expect(blocks[1]).toMatchObject({ kind: 'list', ordered: true })
    expect(blocks[1].kind === 'list' && blocks[1].items).toHaveLength(2)
  })

  it('starts a new list when the kind changes without a blank line', () => {
    const blocks = parseMarkdown('- a\n1. b')
    expect(blocks.map((b) => b.kind === 'list' && b.ordered)).toEqual([false, true])
  })

  it('flattens nested items and continues an item on an indented line', () => {
    const [list] = parseMarkdown('- a\n  - nested\n- b\n  more of b')
    expect(list.kind === 'list' && list.items).toHaveLength(3)
    expect(list.kind === 'list' && list.items[2]).toEqual([
      { kind: 'text', text: 'b' },
      { kind: 'text', text: ' ' },
      { kind: 'text', text: 'more of b' },
    ])
  })

  it('ends a list at an unindented paragraph line', () => {
    const blocks = parseMarkdown('- a\ntext after')
    expect(blocks.map((b) => b.kind)).toEqual(['list', 'paragraph'])
  })

  it('ends a paragraph at a list, a heading or a code block', () => {
    expect(parseMarkdown('text\n- item').map((b) => b.kind)).toEqual(['paragraph', 'list'])
    expect(parseMarkdown('text\n## Head').map((b) => b.kind)).toEqual(['paragraph', 'heading'])
    expect(parseMarkdown('text\n```\ncode\n```').map((b) => b.kind)).toEqual(['paragraph', 'code'])
  })

  it('reads fenced code as is, including an unclosed fence', () => {
    expect(parseMarkdown('```sh\nnpm  install\n# not a heading\n```')).toEqual([
      { kind: 'code', text: 'npm  install\n# not a heading' },
    ])
    expect(parseMarkdown('```\nunclosed')).toEqual([{ kind: 'code', text: 'unclosed' }])
  })

  it('reads a release-please style changelog', () => {
    const blocks = parseMarkdown('## [0.2.0](https://github.com/o/r/compare/v0.1.0...v0.2.0) (2026-10-25)\n\n### Features\n\n* **ui:** add a thing ([abc1234](https://github.com/o/r/commit/abc1234))')
    expect(blocks.map((b) => b.kind)).toEqual(['heading', 'heading', 'list'])
  })

  it('returns no blocks for empty text', () => {
    expect(parseMarkdown('')).toEqual([])
    expect(parseMarkdown('\n\n')).toEqual([])
  })
})

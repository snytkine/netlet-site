import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Markdown from './Markdown'

describe('Markdown', () => {
  it('renders headings (the highest becomes h3), paragraphs and inline formatting', () => {
    render(<Markdown source={'# Title\n\nSome **bold**, *italic* and `code`.'} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Title' })).toBeInTheDocument()
    expect(screen.getByText('bold').tagName).toBe('STRONG')
    expect(screen.getByText('italic').tagName).toBe('EM')
    expect(screen.getByText('code').tagName).toBe('CODE')
  })

  it('gives the highest heading the top level whatever level the text starts at', () => {
    render(<Markdown source={'## Release\n\n### Features\n\n#### Detail'} />)
    expect(screen.getByRole('heading', { level: 3, name: 'Release' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 4, name: 'Features' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 5, name: 'Detail' })).toBeInTheDocument()
  })

  it('never goes deeper than h6 and honours the top level', () => {
    render(<Markdown source={'# Top\n\n###### Deep'} topLevel={4} />)
    expect(screen.getByRole('heading', { level: 4, name: 'Top' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 6, name: 'Deep' })).toBeInTheDocument()
  })

  it('renders text without headings', () => {
    render(<Markdown source={'just text'} />)
    expect(screen.queryByRole('heading')).toBeNull()
  })

  it('renders bullet and numbered lists', () => {
    render(<Markdown source={'- one\n- two\n\n1. first\n2. second'} />)
    expect(screen.getAllByRole('list')[0].tagName).toBe('UL')
    expect(screen.getAllByRole('list')[1].tagName).toBe('OL')
    expect(screen.getAllByRole('listitem')).toHaveLength(4)
  })

  it('renders https links and code blocks', () => {
    render(<Markdown source={'[docs](https://example.com/docs)\n\n```\nnpm install\n```'} />)
    expect(screen.getByRole('link', { name: 'docs' })).toHaveAttribute('href', 'https://example.com/docs')
    expect(screen.getByText('npm install').closest('pre')).toBeInTheDocument()
  })

  it('shows HTML and unsafe links as plain text, never as markup', () => {
    const { container } = render(
      <Markdown source={'<img src=x onerror=alert(1)> and [bad](javascript:alert(1))'} />,
    )
    expect(container.querySelector('img')).toBeNull()
    expect(screen.queryByRole('link')).toBeNull()
    expect(container).toHaveTextContent('<img src=x onerror=alert(1)> and bad')
  })
})

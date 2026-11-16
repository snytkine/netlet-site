import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import PageTransition from './PageTransition'

/** Renders a transition around a page that prints its path, plus links to navigate with. */
function renderTransition() {
  render(
    <MemoryRouter initialEntries={['/one']}>
      <Link to="/two">go</Link>
      <Link to="/three" replace>
        redirect
      </Link>
      <Link to="/one?tab=2">same page</Link>
      <PageTransition>{(location) => <p data-testid="content">{location.pathname + location.search}</p>}</PageTransition>
    </MemoryRouter>,
  )
  const content = () => screen.getByTestId('content')
  const page = () => content().parentElement!
  return { content, page }
}

describe('PageTransition', () => {
  it('shows the current page with the enter animation', () => {
    const { content, page } = renderTransition()
    expect(content()).toHaveTextContent('/one')
    expect(page()).toHaveClass('page-transition', 'page-transition--enter')
  })

  it('keeps the old page on screen while it animates out', async () => {
    const { content, page } = renderTransition()
    await userEvent.click(screen.getByRole('link', { name: 'go' }))
    expect(page()).toHaveClass('page-transition--exit')
    expect(content()).toHaveTextContent('/one')
  })

  it('swaps in the new page and scrolls to the top when the exit animation ends', async () => {
    vi.mocked(window.scrollTo).mockClear()
    const { content, page } = renderTransition()
    await userEvent.click(screen.getByRole('link', { name: 'go' }))
    expect(window.scrollTo).not.toHaveBeenCalled()
    fireEvent.animationEnd(page())
    expect(content()).toHaveTextContent('/two')
    expect(page()).toHaveClass('page-transition--enter')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('ignores animations that end inside the page', async () => {
    const { content, page } = renderTransition()
    await userEvent.click(screen.getByRole('link', { name: 'go' }))
    fireEvent.animationEnd(content())
    expect(content()).toHaveTextContent('/one')
    expect(page()).toHaveClass('page-transition--exit')
  })

  it('does nothing when the enter animation ends', () => {
    vi.mocked(window.scrollTo).mockClear()
    const { content, page } = renderTransition()
    fireEvent.animationEnd(page())
    expect(content()).toHaveTextContent('/one')
    expect(window.scrollTo).not.toHaveBeenCalled()
  })

  it('follows a redirect at once, without an exit animation', async () => {
    const { content, page } = renderTransition()
    await userEvent.click(screen.getByRole('link', { name: 'redirect' }))
    expect(content()).toHaveTextContent('/three')
    expect(page()).toHaveClass('page-transition--enter')
  })

  it('does not animate when only the query string changes', async () => {
    const { content, page } = renderTransition()
    await userEvent.click(screen.getByRole('link', { name: 'same page' }))
    expect(content()).toHaveTextContent('/one?tab=2')
    expect(page()).toHaveClass('page-transition--enter')
  })
})
